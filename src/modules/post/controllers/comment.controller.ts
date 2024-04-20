import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from "@nestjs/common";

import { CreateCommentDto } from "../dto/comment.dto";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { AuthGuard } from "src/modules/auth/guards/auth.guard";
import { PostCommentService } from "../services/comment.service";
import { Pagination } from "src/common/decorators/pagination.decorator";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";

@Controller("post-comment")
@ApiTags("Post Comment")
@ApiBearerAuth("Authorization")
@UseGuards(AuthGuard)
export class PostCommentController {
	constructor(private readonly postCommentService: PostCommentService) {}

	@Post("/")
	@ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
	create(@Body() commentDto: CreateCommentDto) {
		return this.postCommentService.create(commentDto);
	}
    
	@Get("/")
	@Pagination()
	find(@Query() paginationDto: PaginationDto) {
		return this.postCommentService.find(paginationDto);
	}

	@Get("/like/:id")
	likeToggle(@Param("id", ParseIntPipe) id: number) {
		return this.postCommentService.likeComment(id);
	}
}
