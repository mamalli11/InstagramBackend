import {
	Scope,
	Inject,
	Injectable,
	NotFoundException,
	ConflictException,
	BadRequestException,
} from "@nestjs/common";
import { Request } from "express";
import { compareSync } from "bcrypt";
import { Repository } from "typeorm";
import { REQUEST } from "@nestjs/core";
import { isDate } from "class-validator";
import { InjectRepository } from "@nestjs/typeorm";

import {
	AuthMessage,
	PublicMessage,
	ConflictMessage,
	NotFoundMessage,
	BadRequestMessage,
} from "src/common/enums/message.enum";
import { OtpEntity } from "./entities/otp.entity";
import { AuthService } from "../auth/auth.service";
import { UserEntity } from "./entities/user.entity";
import { TokenService } from "../auth/tokens.service";
import { BlockEntity } from "./entities/block.entity";
import { AuthMethod } from "../auth/enums/method.enum";
import { FollowEntity } from "./entities/follow.entity";
import { CookieKeys } from "src/common/enums/cookie.enum";
import { ProfileEntity } from "./entities/profile.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { FollowRequestDto } from "./dto/followRequest.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { ChangeUsernameDto, UpdateUserDto } from "./dto/profile.dto";
import { FollowRequestEntity } from "./entities/follow-requst.entity";
import { GenderType, PageType, RequestType } from "./enums/profile.enum";
import { paginationGenerator, paginationSolver } from "src/common/utils/pagination.util";

@Injectable({ scope: Scope.REQUEST })
export class UserService {
	constructor(
		@InjectRepository(OtpEntity) private otpRepository: Repository<OtpEntity>,
		@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
		@InjectRepository(BlockEntity) private blockRepository: Repository<BlockEntity>,
		@InjectRepository(FollowEntity) private followRepository: Repository<FollowEntity>,
		@InjectRepository(ProfileEntity) private profileRepository: Repository<ProfileEntity>,
		@InjectRepository(FollowRequestEntity)
		private followReqRepository: Repository<FollowRequestEntity>,
		@Inject(REQUEST) private request: Request,
		private authService: AuthService,
		private tokenService: TokenService,
	) {}
	profile() {
		const { id } = this.request.user;
		return this.userRepository
			.createQueryBuilder(EntityName.User)
			.where({ id })
			.leftJoinAndSelect("user.profile", "profile")
			.loadRelationCountAndMap("user.followers", "user.followers")
			.loadRelationCountAndMap("user.following", "user.following")
			.getOne();
	}
	async updateInfo(file: Express.Multer.File, updateUserDto: UpdateUserDto) {
		if (file) updateUserDto.profile_picture = file?.path?.slice(7);

		const { id: userId, profileId } = this.request.user;
		let profile = await this.profileRepository.findOneBy({ userId });
		let user = await this.userRepository.findOneBy({ id: userId });

		const {
			bio,
			birthday,
			gender,
			username,
			profile_picture,
			fullname,
			website,
			is_private,
			country,
			language,
		} = updateUserDto;

		if (profile) {
			if (username) if (this.changeUsername(username)) user.username = username;
			if (fullname) profile.fullname = fullname;
			if (bio) profile.bio = bio;
			if (website) profile.website = website;
			if (birthday && isDate(new Date(birthday))) profile.birthday = new Date(birthday);
			if (gender && Object.values(GenderType as any).includes(gender)) profile.gender = gender;
			if (country) profile.country = country;
			if (language) profile.language = language;
			if (profile_picture) profile.profile_picture = profile_picture;

			profile = await this.profileRepository.save(profile);

			if (is_private)
				await this.userRepository.update(
					{ id: userId },
					{ is_private: is_private === PageType.Private },
				);
		}
		if (!profileId) {
			await this.userRepository.update({ id: userId }, { profileId: profile.id });
		}
		return { message: PublicMessage.Updated };
	}
	async removeAccount() {
		const { id } = this.request.user;
		await this.userRepository.delete({ id });
		await this.profileRepository.delete({ userId: id });
		await this.otpRepository.delete({ userId: id });
		return { message: AuthMessage.DeleteAccount };
	}
	async changeUsername(username: string) {
		const { id } = this.request.user;
		const user = await this.userRepository.findOneBy({ username });
		if (user && user?.id !== id) {
			throw new ConflictException(ConflictMessage.Username);
		} else if (user && user.id == id) {
			return { message: PublicMessage.Updated };
		}
		await this.userRepository.update({ id }, { username });
		return { message: PublicMessage.Updated };
	}
	async changePassword(changePasswordDto: ChangePasswordDto) {
		const { id } = this.request.user;
		const { newPassword, oldPassword } = changePasswordDto;

		const [UserEntity] = await this.userRepository.find({
			where: { id },
			select: ["id", "password", "passwordChangeAt"],
		});

		if (!UserEntity) throw new NotFoundException(NotFoundMessage.NotFoundUser);

		if (!compareSync(oldPassword, UserEntity.password))
			throw new BadRequestException("Old password is incorrect");

		const hashedPassword = this.authService.hashPassword(newPassword);
		UserEntity.password = hashedPassword;
		UserEntity.passwordChangeAt = new Date();
		await this.userRepository.save(UserEntity);

		return { message: PublicMessage.Updated };
	}
	async changeEmail(email: string) {
		const { id } = this.request.user;
		const user = await this.userRepository.findOneBy({ email });
		if (user && user?.id !== id) {
			throw new ConflictException(ConflictMessage.Email);
		} else if (user && user.id == id) {
			return { message: PublicMessage.Updated };
		}

		await this.userRepository.update({ id }, { new_email: email });
		const otp = await this.authService.saveOtp(id, AuthMethod.Email);
		const token = this.tokenService.createEmailToken({ email });
		return { code: otp.code, token };
	}
	async verifyEmail(code: string) {
		const { id: userId, new_email } = this.request.user;
		const token = this.request.cookies?.[CookieKeys.EmailOTP];
		if (!token) throw new BadRequestException(AuthMessage.ExpiredCode);
		const { email } = this.tokenService.verifyEmailToken(token);
		if (email !== new_email) throw new BadRequestException(BadRequestMessage.SomeThingWrong);

		const otp = await this.checkOtp(userId, code);
		if (otp.method !== AuthMethod.Email)
			throw new BadRequestException(BadRequestMessage.SomeThingWrong);

		await this.userRepository.update(
			{ id: userId },
			{ email, verify_email: true, new_email: null },
		);
		return { message: PublicMessage.Updated };
	}
	async changePhone(phone: string) {
		const { id } = this.request.user;
		const user = await this.userRepository.findOneBy({ phone });
		if (user && user?.id !== id) {
			throw new ConflictException(ConflictMessage.Phone);
		} else if (user && user.id == id) {
			return { message: PublicMessage.Updated };
		}

		await this.userRepository.update({ id }, { new_phone: phone });
		const otp = await this.authService.saveOtp(id, AuthMethod.Phone);
		const token = this.tokenService.createPhoneToken({ phone });
		return { code: otp.code, token };
	}
	async verifyPhone(code: string) {
		const { id: userId, new_phone } = this.request.user;
		const token = this.request.cookies?.[CookieKeys.PhoneOTP];
		if (!token) throw new BadRequestException(AuthMessage.ExpiredCode);
		const { phone } = this.tokenService.verifyPhoneToken(token);
		if (phone !== new_phone) throw new BadRequestException(BadRequestMessage.SomeThingWrong);

		const otp = await this.checkOtp(userId, code);
		if (otp.method !== AuthMethod.Phone)
			throw new BadRequestException(BadRequestMessage.SomeThingWrong);

		await this.userRepository.update(
			{ id: userId },
			{ phone, verify_phone: true, new_phone: null },
		);
		return { message: PublicMessage.Updated };
	}
	async checkOtp(userId: number, code: string) {
		const otp = await this.otpRepository.findOneBy({ userId });
		if (!otp) throw new BadRequestException(NotFoundMessage.NotFound);
		const now = new Date();
		if (otp.expiresIn < now) throw new BadRequestException(AuthMessage.ExpiredCode);
		if (otp.code !== code) throw new BadRequestException(AuthMessage.TryAgain);
		return otp;
	}
	async followers(paginationDto: PaginationDto) {
		const { limit, page, skip } = paginationSolver(paginationDto);
		const { id: userId } = this.request.user;
		const [followers, count] = await this.followRepository.findAndCount({
			where: { followerId: userId },
			relations: {
				following: { profile: true },
			},
			select: {
				id: true,
				following: {
					id: true,
					username: true,
					profile: {
						id: true,
						fullname: true,
						profile_picture: true,
					},
				},
			},
			skip,
			take: limit,
		});
		return {
			pagination: paginationGenerator(count, page, limit),
			followers,
		};
	}
	async following(paginationDto: PaginationDto) {
		const { limit, page, skip } = paginationSolver(paginationDto);
		const { id: userId } = this.request.user;
		const [following, count] = await this.followRepository.findAndCount({
			where: { followingId: userId },
			relations: {
				follower: { profile: true },
			},
			select: {
				id: true,
				follower: {
					id: true,
					username: true,
					profile: {
						id: true,
						fullname: true,
						profile_picture: true,
					},
				},
			},
			skip,
			take: limit,
		});
		return {
			pagination: paginationGenerator(count, page, limit),
			following,
		};
	}
	async followToggle(usernameDto: ChangeUsernameDto) {
		const { id: userId } = this.request.user;
		const following = await this.userRepository.findOneBy({ username: usernameDto.username });
		if (!following) throw new NotFoundException(NotFoundMessage.NotFoundUser);
		if (following.id === userId) throw new BadRequestException(BadRequestMessage.SomeThingWrong);

		if (following.is_private) {
			const isFollowing = await this.followRepository.findOneBy({
				followingId: userId,
				followerId: following.id,
			});
			if (isFollowing) {
				if (isFollowing) {
					await this.followRepository.remove(isFollowing);
					return { message: PublicMessage.UnFollow };
				} else {
					await this.followRepository.insert({
						followingId: userId,
						followerId: following.id,
					});
					return { message: PublicMessage.Followed };
				}
			} else {
				const follow = await this.followReqRepository.findOneBy({
					userId,
					requseted: following.id,
				});
				if (follow) {
					await this.followReqRepository.remove(follow);
					return { message: PublicMessage.ReqUnFollow };
				}
				await this.followReqRepository.insert({ userId, requseted: following.id });
				return { message: PublicMessage.ReqFollow };
			}
		}
	}
	async userProfile(username: string) {
		const { id } = this.request.user;
		const user = await this.userRepository.findOneBy({ username });
		if (!user) throw new NotFoundException(NotFoundMessage.NotFoundUser);

		const block = await this.blockRepository.findOneBy({ userId: user.id, blockedId: id });
		if (block) throw new BadRequestException(BadRequestMessage.SomeThingWrong);

		if (user.is_private) {
			const isFollow = await this.followRepository.findOneBy({
				followingId: id,
				followerId: user.id,
			});
			if (!isFollow) {
				return this.userRepository
					.createQueryBuilder(EntityName.User)
					.where({ id: user.id })
					.leftJoinAndSelect("user.profile", "profile")
					.select([
						"user.id",
						"user.username",
						"user.is_private",
						"user.created_at",
						"user.is_verified",
						"profile.bio",
						"profile.fullname",
						"profile.website",
						"profile.profile_picture",
					])
					.loadRelationCountAndMap("user.followers", "user.followers")
					.loadRelationCountAndMap("user.following", "user.following")
					.loadRelationCountAndMap("user.posts", "user.posts")
					.getOne();
			}
		}

		return this.userRepository.find({
			where: { id: user.id, posts: { status: "published" } },
			relations: {
				profile: true,
				posts: { media: true },
			},
			select: {
				posts: { type: true, media: true, status: true, id: true },
				profile: { fullname: true, profile_picture: true, bio: true, website: true },
				username: true,
				id: true,
				is_private: true,
				is_verified: true,
				created_at: true,
			},
			order: { posts: { id: "DESC" } },
		});
	}
	async blockToggle(userId: number) {
		const { id } = this.request.user;
		const user = await this.userRepository.findOneBy({ id: userId });
		if (!user) throw new NotFoundException(NotFoundMessage.NotFoundUser);
		if (user.id === id) throw new BadRequestException(BadRequestMessage.SomeThingWrong);

		const isBlock = await this.blockRepository.findOneBy({ blockedId: userId, userId: id });
		if (isBlock) {
			await this.blockRepository.remove(isBlock);
			return { message: PublicMessage.UnBlocked };
		}
		await this.blockRepository.insert({ blockedId: userId, userId: id });
		return { message: PublicMessage.Blocked };
	}
	async blockList(paginationDto: PaginationDto) {
		const { id } = this.request.user;
		const { limit, page, skip } = paginationSolver(paginationDto);
		const [blocks, count] = await this.blockRepository.findAndCount({
			where: { userId: id },
			relations: {
				blocked: { profile: true },
			},
			select: {
				id: true,
				blocked: {
					id: true,
					username: true,
					profile: {
						fullname: true,
						profile_picture: true,
					},
				},
			},
			skip,
			take: limit,
		});
		return {
			pagination: paginationGenerator(count, page, limit),
			blocks,
		};
	}
	async requestManagement(followRequestDto: FollowRequestDto) {
		const { id } = this.request.user;
		const { RequestStatus, userId } = followRequestDto;
		const ReqFollow = await this.followReqRepository.findOneBy({ requseted: id, userId: userId });
		if (!ReqFollow) throw new NotFoundException(NotFoundMessage.NotFound);

		if (RequestStatus === RequestType.Rejected) {
			await this.followReqRepository.remove(ReqFollow);
			return { message: PublicMessage.ReqFollowRejected };
		}
		if (RequestStatus === RequestType.Accepted) {
			await this.followReqRepository.remove(ReqFollow);
			await this.followRepository.insert({ followingId: userId, followerId: id });
			return { message: PublicMessage.ReqFollowAccepted };
		}
		return { message: PublicMessage.Nothing };
	}
	async requestFollowList(paginationDto: PaginationDto) {
		const { id } = this.request.user;
		const { limit, page, skip } = paginationSolver(paginationDto);
		const [request, count] = await this.followReqRepository.findAndCount({
			where: { requseted: id, status: "waiting" },
			relations: {
				user: { profile: true },
			},
			select: {
				id: true,
				user: {
					id: true,
					username: true,
					profile: {
						fullname: true,
						profile_picture: true,
					},
				},
			},
			skip,
			take: limit,
		});
		return {
			pagination: paginationGenerator(count, page, limit),
			request,
		};
	}
}
