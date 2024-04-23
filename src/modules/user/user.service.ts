import {
	Scope,
	Inject,
	Injectable,
	NotFoundException,
	ConflictException,
	BadRequestException,
} from "@nestjs/common";
import { Request } from "express";
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
import { GenderType } from "./enums/profile.enum";
import { UpdateUserDto } from "./dto/profile.dto";
import { AuthService } from "../auth/auth.service";
import { UserEntity } from "./entities/user.entity";
import { TokenService } from "../auth/tokens.service";
import { AuthMethod } from "../auth/enums/method.enum";
import { FollowEntity } from "./entities/follow.entity";
import { CookieKeys } from "src/common/enums/cookie.enum";
import { ProfileEntity } from "./entities/profile.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { paginationGenerator, paginationSolver } from "src/common/utils/pagination.util";

@Injectable({ scope: Scope.REQUEST })
export class UserService {
	constructor(
		@InjectRepository(OtpEntity) private otpRepository: Repository<OtpEntity>,
		@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
		@InjectRepository(FollowEntity) private followRepository: Repository<FollowEntity>,
		@InjectRepository(ProfileEntity) private profileRepository: Repository<ProfileEntity>,
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

			if (is_private) {
				await this.userRepository.update({ id: userId }, { is_private: Boolean(is_private) });
			}
		}
		if (!profileId) {
			await this.userRepository.update({ id: userId }, { profileId: profile.id });
		}
		return { message: PublicMessage.Updated };
	}
	async remove() {
		const { id } = this.request.user;
		await this.userRepository.delete({ id });
		await this.profileRepository.delete({ userId: id });
		return this.otpRepository.delete({ userId: id });
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
						bio: true,
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
						bio: true,
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
	async followToggle(followingId: number) {
		const { id: userId } = this.request.user;
		const following = await this.userRepository.findOneBy({ id: followingId });
		if (!following) throw new NotFoundException(NotFoundMessage.NotFoundUser);

		const isFollowing = await this.followRepository.findOneBy({
			followingId,
			followerId: userId,
		});
		let message = PublicMessage.Followed;
		if (isFollowing) {
			message = PublicMessage.UnFollow;
			await this.followRepository.remove(isFollowing);
		} else {
			await this.followRepository.insert({ followingId, followerId: userId });
		}
		return { message };
	}
}
