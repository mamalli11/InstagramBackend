import {
	IsUrl,
	IsEnum,
	Length,
	Matches,
	IsEmail,
	IsString,
	IsOptional,
	IsMobilePhone,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { GenderType, PageType } from "../enums/profile.enum";
import { ValidationMessage } from "src/common/enums/message.enum";

export class UpdateUserDto {
	@ApiPropertyOptional({ nullable: true })
	@IsOptional()
	@Length(4, 30)
	@IsString()
	@Matches(/^[a-zA-Z0-9._]+$/, { message: "username format is invalid" })
	username: string;
	@ApiPropertyOptional({ nullable: true })
	@IsOptional()
	@IsString()
	@Length(3, 50)
	fullname: string;
	@ApiPropertyOptional({ nullable: true })
	@IsOptional()
	@IsString()
	@Length(0, 50)
	bio: string;
	@ApiPropertyOptional({ nullable: true, format: "binary" })
	@IsOptional()
	profile_picture: string;
	@ApiPropertyOptional({ nullable: true })
	@IsOptional()
	@IsUrl()
	website: string;
	@ApiPropertyOptional({ nullable: true, enum: PageType })
	@IsOptional()
	@IsEnum(PageType)
	is_private: PageType;
	@ApiPropertyOptional({ nullable: true, example: "1999-02-22T12:01:26.487Z" })
	@IsOptional()
	birthday: Date;
	@ApiPropertyOptional({ nullable: true, enum: GenderType })
	@IsOptional()
	@IsEnum(GenderType)
	gender: GenderType;
	@ApiPropertyOptional({ nullable: true })
	@IsOptional()
	@IsString()
	country: string;
	@ApiPropertyOptional({ nullable: true })
	@IsOptional()
	@IsString()
	@Length(0, 5)
	language: string;
}
export class ChangeEmailDto {
	@ApiProperty()
	@IsEmail({}, { message: ValidationMessage.InvalidEmailFormat })
	email: string;
}
export class ChangePhoneDto {
	@ApiProperty()
	@IsMobilePhone("fa-IR", {}, { message: ValidationMessage.InvalidPhoneFormat })
	phone: string;
}
export class ChangeUsernameDto {
	@ApiProperty()
	@IsString()
	@Length(4, 30)
	username: string;
}
