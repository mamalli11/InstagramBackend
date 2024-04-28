import {
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	Controller,
	UploadedFile,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";

import { StoryService } from "./story.service";
import { AuthGuard } from "../auth/guards/auth.guard";
import { CreateStoryDto } from "./dto/create-story.dto";
import { UpdateStoryDto } from "./dto/update-story.dto";
import { multerStorage } from "src/common/utils/multer.util";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";

@ApiTags("Story")
@Controller("story")
@ApiBearerAuth("Authorization")
@UseGuards(AuthGuard)
export class StoryController {
	constructor(private readonly storyService: StoryService) {}

	@Post("/newStory")
	@ApiConsumes(SwaggerConsumes.MultipartData)
	@UseInterceptors(FileInterceptor("media", { storage: multerStorage("story") }))
	newStory(@UploadedFile() files: Express.Multer.File, @Body() createStoryDto: CreateStoryDto) {
		return this.storyService.newStory(files, createStoryDto);
	}

	@Get()
	findAllStoryUser() {
		return this.storyService.findAllStoryUser();
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.storyService.findOne(+id);
	}

	@Patch(":id")
	update(@Param("id") id: string, @Body() updateStoryDto: UpdateStoryDto) {
		return this.storyService.update(+id, updateStoryDto);
	}

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.storyService.remove(+id);
	}
}
