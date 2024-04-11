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
} from "@nestjs/common";

import { UserService } from "./user.service";
import { UpdateUserDto } from "./dto/profile.dto";
import { AuthGuard } from "../auth/guards/auth.guard";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerStorage } from "src/common/utils/multer.util";
import { UploadedOptionalFile } from "src/common/decorators/upload-file.decorator";
import { ProfileImages } from "./types/files";

@Controller("user")
@ApiTags("User")
@ApiBearerAuth("Authorization")
@UseGuards(AuthGuard)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get("/profile")
	@ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
	findOne(@Param("id") id: string) {
		return this.userService.findOne(+id);
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
}
