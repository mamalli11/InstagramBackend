import { FileFieldsInterceptor } from "@nestjs/platform-express";
import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	UseInterceptors,
	Put,
	Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";

import { PostService } from "./post.service";
import { PostMediasType } from "./types/files";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { AuthGuard } from "../auth/guards/auth.guard";
import { multerStorage } from "src/common/utils/multer.util";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { UploadedOptionalFiles } from "src/common/decorators/upload-file.decorator";
import { SkipAuth } from "src/common/decorators/skip-auth.decorator";
import { Pagination } from "src/common/decorators/pagination.decorator";
import { FilterPost } from "src/common/decorators/filter.decorator";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { FilterPostDto } from "./dto/filter.dto";

@Controller("post")
@ApiTags("Post")
@ApiBearerAuth("Authorization")
@UseGuards(AuthGuard)
export class PostController {
	constructor(private readonly postService: PostService) {}

	@Post('/newPost')
	@ApiConsumes(SwaggerConsumes.MultipartData)
	@ApiOperation({ summary: "Create New Post" })
	@UseInterceptors(
		FileFieldsInterceptor(
			[
				{ name: "media1", maxCount: 1 },
				{ name: "media2", maxCount: 1 },
				{ name: "media3", maxCount: 1 },
				{ name: "media4", maxCount: 1 },
				{ name: "media5", maxCount: 1 },
				{ name: "media6", maxCount: 1 },
				{ name: "media7", maxCount: 1 },
				{ name: "media8", maxCount: 1 },
				{ name: "media9", maxCount: 1 },
				{ name: "media10", maxCount: 1 },
			],
			{
				storage: multerStorage("post-media"),
			},
		),
	)
	create(@UploadedOptionalFiles() files: PostMediasType, @Body() createPostDto: CreatePostDto) {
		return this.postService.create(files, createPostDto);
	}

	@Get('/myProfile')
	findAllPostsUser() {
		return this.postService.findAllPostsUser();
	}

	@Get("/")
	@SkipAuth()
	@Pagination()
	@FilterPost()
	find(@Query() paginationDto: PaginationDto, @Query() filterDto: FilterPostDto) {
		return this.postService.postList(paginationDto, filterDto);
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.postService.findOne(+id);
	}

	@Put(":id")
	@ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
	update(@Param("id") id: string, @Body() updatePostDto: UpdatePostDto) {
		return this.postService.update(+id, updatePostDto);
	}

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.postService.remove(+id);
	}
}
