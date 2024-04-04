import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthDto } from "./dto/auth.dto";
import { UserEntity } from "../user/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { OtpEntity } from "../user/entities/otp.entity";
import { Repository } from "typeorm";
import { AuthType } from "./enums/type.enum";
import { AuthMethod } from "./enums/method.enum";

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
		@InjectRepository(OtpEntity) private otpRepository: Repository<OtpEntity>,

	) {}
	userExistence(authDto: AuthDto) {
		const { method, type, username } = authDto;
		switch (type) {
			case AuthType.Login:
				return this.login(method, username);
			case AuthType.Register:
				return this.register(method, username);
			default:
				throw new UnauthorizedException();
		}
	}
	async login(method: AuthMethod, username: string) {}
	async register(method: AuthMethod, username: string) {}
}
