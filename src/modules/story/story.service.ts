import { Request } from "express";
import { Repository } from "typeorm";
import { REQUEST } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { ForbiddenException, Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";

import { StoryEntity } from "./entities/story.entity";
import { CreateStoryDto } from "./dto/create-story.dto";
import { UpdateStoryDto } from "./dto/update-story.dto";
import { UserEntity } from "../user/entities/user.entity";
import { PostService } from "../post/services/post.service";
import { HashtagService } from "../hashtag/hashtag.service";
import { AuthMessage, NotFoundMessage, PublicMessage } from "src/common/enums/message.enum";

@Injectable({ scope: Scope.REQUEST })
export class StoryService {
	constructor(
		@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
		@InjectRepository(StoryEntity) private storyRepository: Repository<StoryEntity>,
		@Inject(REQUEST) private request: Request,
		private hashtagService: HashtagService,
		private postService: PostService,
	) {}

	async newStory(file: Express.Multer.File, createStoryDto: CreateStoryDto) {
		if (file) createStoryDto.media = file?.path?.slice(7);

		const { id: userId } = this.request.user;
		let user = await this.userRepository.findOneBy({ id: userId });

		const { caption, location, media, mediaType, mention, storyStatus, tags, isComment } =
			createStoryDto;

		let story = await this.storyRepository.insert({
			userId,
			mediaType,
			storyStatus,
			mediaUrl: media,
			tags: this.postService.convertToArray(tags),
			mention: this.postService.convertToArray(mention),
			location: this.postService.convertToArray(location),
			isComment: isComment.toString() === "true" ? true : false,
			caption: await this.hashtagService.createHashTag(caption),
		});

		return { message: PublicMessage.Created, story };
	}

	findAllStoryUser() {
		const { id } = this.request.user;
		const story = this.storyRepository.find({ where: { userId: id } });
		return { message: PublicMessage.Successfuly, story };
	}

	findOne(id: number) {
		return `This action returns a #${id} story`;
	}

	update(id: number, updateStoryDto: UpdateStoryDto) {
		return `This action updates a #${id} story`;
	}

	async remove(storyId: number) {
		const { id: userId } = this.request.user;
		const story = await this.storyRepository.findOneBy({ id: storyId });
		if (!story) throw new NotFoundException(NotFoundMessage.NotFoundStory);
		if (story.userId === userId) throw new ForbiddenException(AuthMessage.Forbidden);

		await this.storyRepository.remove(story);
		return { message: PublicMessage.Deleted, story };
	}
}
