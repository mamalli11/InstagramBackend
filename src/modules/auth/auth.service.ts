import {
	BadRequestException,
	ConflictException,
	Inject,
	Injectable,
	Scope,
	UnauthorizedException,
} from "@nestjs/common";
import { Request, Response } from "express";
import { randomInt } from "crypto";
import { Repository } from "typeorm";
import { REQUEST } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { isEmail, isMobilePhone } from "class-validator";
import { compareSync, genSaltSync, hashSync } from "bcrypt";

import { TokenService } from "./tokens.service";
import { AuthResponse } from "./types/response";
import { AuthMethod, RegisterMethod } from "./enums/method.enum";
import { AuthDto, RegisterDto } from "./dto/auth.dto";
import { OtpEntity } from "../user/entities/otp.entity";
import { UserEntity } from "../user/entities/user.entity";
import { CookieKeys } from "src/common/enums/cookie.enum";
import { ProfileEntity } from "../user/entities/profile.entity";
import { AuthMessage, BadRequestMessage, PublicMessage } from "src/common/enums/message.enum";

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
	constructor(
		@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
		@InjectRepository(ProfileEntity) private profileRepository: Repository<ProfileEntity>,
		@InjectRepository(OtpEntity) private otpRepository: Repository<OtpEntity>,
		@Inject(REQUEST) private request: Request,
		private tokenService: TokenService,
	) {}

	async login(authDto: AuthDto, res: Response) {
		const { method, password, username } = authDto;
		const validUsername = this.usernameValidator(method, username);
		let user: UserEntity = await this.checkExistUser(method, validUsername);
		if (!user) throw new UnauthorizedException(AuthMessage.NotFoundAccount);
		if (!compareSync(password, user.password))
			throw new UnauthorizedException("email or password is incorrect");

		const otp = await this.saveOtp(user.id);
		const token = this.tokenService.createOtpToken({ userId: user.id });
		const result = { token, code: otp.code };
		return this.sendResponse(res, result);
	}
	async register(registerDto: RegisterDto, res: Response) {
		const { username, fullname, emailOrPhone, password, method } = registerDto;

		const validUsername = this.usernameValidator(method, emailOrPhone);
		let user: UserEntity = await this.checkExistUser(method, validUsername);
		if (user) throw new ConflictException(AuthMessage.AlreadyExistAccount);

		user = this.userRepository.create({
			[method]: emailOrPhone,
			username,
			password: this.hashPassword(password),
		});
		user = await this.userRepository.save(user);

		let profile = this.profileRepository.create({ fullname, userId: user.id });
		profile = await this.profileRepository.save(profile);
		await this.userRepository.update({ id: user.id }, { profileId: profile.id });

		const otp = await this.saveOtp(user.id);
		const token = this.tokenService.createOtpToken({ userId: user.id });

		const result = { token, code: otp.code };
		return this.sendResponse(res, result);
	}
	async sendResponse(res: Response, result: AuthResponse) {
		const { token, code } = result;
		res.cookie(CookieKeys.OTP, token, {
			httpOnly: true,
			expires: new Date(Date.now() + 1000 * 60 * 2),
		});
		return res.json({
			message: PublicMessage.SentOtp,
			code,
		});
	}
	async saveOtp(userId: number) {
		const code = randomInt(10000, 99999).toString();
		const expiresIn = new Date(Date.now() + 1000 * 60 * 2);
		let otp = await this.otpRepository.findOneBy({ userId });
		let existOtp = false;
		if (otp) {
			existOtp = true;
			otp.code = code;
			otp.expiresIn = expiresIn;
		} else {
			otp = this.otpRepository.create({ code, expiresIn, userId });
		}
		otp = await this.otpRepository.save(otp);
		if (!existOtp) {
			await this.userRepository.update({ id: userId }, { otpId: otp.id });
		}
		return otp;
	}
	async checkOtp(code: string) {
		const token = this.request.cookies?.[CookieKeys.OTP];
		if (!token) throw new UnauthorizedException(AuthMessage.ExpiredCode);
		const { userId } = this.tokenService.verifyOtpToken(token);
		const otp = await this.otpRepository.findOneBy({ userId });
		console.log(otp);
		if (!otp) throw new UnauthorizedException(AuthMessage.LoginAgain);
		console.log("*************************");
		const now = new Date();
		if (otp.expiresIn < now) throw new UnauthorizedException(AuthMessage.ExpiredCode);
		if (otp.code !== code) throw new UnauthorizedException(AuthMessage.TryAgain);
		const accessToken = this.tokenService.createAccessToken({ userId });
		return {
			message: PublicMessage.LoggedIn,
			accessToken,
		};
	}
	async checkExistUser(method: AuthMethod|RegisterMethod, username: string) {
		let user: UserEntity;
		if (method === AuthMethod.Phone) {
			user = await this.userRepository.findOneBy({ phone: username });
		} else if (method === AuthMethod.Email) {
			user = await this.userRepository.findOneBy({ email: username });
		} else if (method === AuthMethod.Username) {
			user = await this.userRepository.findOneBy({ username });
		} else {
			throw new BadRequestException(BadRequestMessage.InValidLoginData);
		}
		return user;
	}
	hashPassword(password: string) {
		const salt = genSaltSync(10);
		return hashSync(password, salt);
	}
	usernameValidator(method: AuthMethod|RegisterMethod, username: string) {
		switch (method) {
			case AuthMethod.Email:
				if (isEmail(username)) return username;
				throw new BadRequestException("Email format is incorrect");

			case AuthMethod.Phone:
				if (isMobilePhone(username, "fa-IR")) return username;
				throw new BadRequestException("Phone format is incorrect");

			case AuthMethod.Username:
				return username;
			default:
				throw new UnauthorizedException("username data is not valid");
		}
	}
	async validateAccessToken(token: string) {
		const { userId } = this.tokenService.verifyAccessToken(token);
		const user = await this.userRepository.findOneBy({ id: userId });
		if (!user) throw new UnauthorizedException(AuthMessage.LoginAgain);
		return user;
	}
}
