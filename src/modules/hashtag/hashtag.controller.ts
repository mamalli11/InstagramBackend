import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Controller, Delete, Get, Param, Query, UseGuards } from "@nestjs/common";

import { HashtagService } from "./hashtag.service";
import { AuthGuard } from "../auth/guards/auth.guard";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { FilterPost } from "src/common/decorators/filter.decorator";
import { Pagination } from "src/common/decorators/pagination.decorator";
import { FilterHashtagsDto } from "./dto/filter.dto";

@Controller("hashtag")
@ApiTags("HashTags")
@ApiBearerAuth("Authorization")
@UseGuards(AuthGuard)
export class HashtagController {
	constructor(private readonly hashtagService: HashtagService) {}

	@Get()
    @Pagination()
    @FilterPost()
	findAll(@Query() paginationDto: PaginationDto, @Query() filterDto: FilterHashtagsDto) {
		return this.hashtagService.findAll(paginationDto, filterDto);
	}

	@Get(":hashtagId")
	findOne(@Param("hashtagId") hashtagId: number) {
		return this.hashtagService.findOne(+hashtagId);
	}

	@Delete(":hashtagId")
	remove(@Param("hashtagId") hashtagId: number) {
		return this.hashtagService.remove(+hashtagId);
	}
}
