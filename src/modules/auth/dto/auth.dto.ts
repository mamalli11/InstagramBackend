import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString, Length, Matches } from "class-validator";

import { AuthMethod, RegisterMethod } from "../enums/method.enum";
import { ConfirmedPassword } from "src/common/decorators/password.decorators";

export class AuthDto {
	@ApiProperty()
	@IsString()
	@Length(3, 30)
	username: string;
	@ApiProperty()
	@IsString()
	@Length(8, 50)
	password: string;
	@ApiProperty({ enum: AuthMethod })
	@IsEnum(AuthMethod)
	method: AuthMethod;
}

export class RegisterDto {
	@ApiProperty()
	@IsString()
	@Length(4, 30)
	@Matches(/^[a-zA-Z0-9._]+$/, { message: "username format is invalid" })
	username: string;
	@ApiProperty()
	@IsString()
	@Length(3, 50)
	fullname: string;
	@ApiProperty()
	@IsString()
	@Length(3, 50)
	emailOrPhone: string;
	@ApiProperty()
	@IsString()
	@Length(8, 50)
	password: string;
	@ApiProperty()
	@IsString()
	@ConfirmedPassword("password")
	confirm_password: string;
	@ApiProperty({ enum: RegisterMethod })
	@IsEnum(RegisterMethod)
	method: RegisterMethod;
}

export class CheckOtpDto {
	@ApiProperty()
	@IsString()
	@Length(5, 5)
	code: string;
}
