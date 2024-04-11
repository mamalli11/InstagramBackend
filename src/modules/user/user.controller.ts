import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import {
	Controller,
	Get,
	Body,
	Param,
	Delete,
	UseGuards,
	Put,
	UseInterceptors,
	Patch,
	Res,
	Post,
} from "@nestjs/common";

import { UserService } from "./user.service";
import { ChangeEmailDto, UpdateUserDto } from "./dto/profile.dto";
import { AuthGuard } from "../auth/guards/auth.guard";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerStorage } from "src/common/utils/multer.util";
import { UploadedOptionalFile } from "src/common/decorators/upload-file.decorator";
import { ProfileImages } from "./types/files";
import { CookiesOptionsToken } from "src/common/utils/cookie.util";
import { CookieKeys } from "src/common/enums/cookie.enum";
import { CheckOtpDto } from "../auth/dto/auth.dto";
import { Response } from "express";
import { PublicMessage } from "src/common/enums/message.enum";

@Controller("user")
@ApiTags("User")
@ApiBearerAuth("Authorization")
@UseGuards(AuthGuard)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get("/profile")
	@ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
	findOne() {
		return this.userService.findOne();
	}

	@Put("/profile")
	@ApiConsumes(SwaggerConsumes.MultipartData)
	@UseInterceptors(FileInterceptor("profile_picture", { storage: multerStorage("user-profile") }))
	updateInfo(
		@UploadedOptionalFile() files: Express.Multer.File,
		@Body() updateUserDto: UpdateUserDto,
	) {
		return this.userService.updateInfo(files, updateUserDto);
	}

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.userService.remove(+id);
	}
	@Patch("/change-email")
	@ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
	async changeEmail(@Body() emailDto: ChangeEmailDto, @Res() res: Response) {
		const { code, token, message } = await this.userService.changeEmail(emailDto.email);
		if (message) return res.json({ message });

		res.cookie(CookieKeys.EmailOTP, token, CookiesOptionsToken());
		res.json({ code, message: PublicMessage.SentOtp });
	}

	@Post("/verify-email-otp")
	@ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
	async verifyEmail(@Body() otpDto: CheckOtpDto) {
		return this.userService.verifyEmail(otpDto.code);
	}
}
