import { Request } from "express";
import { Not, Repository } from "typeorm";
import { REQUEST } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { ForbiddenException, Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";

import { StoryEntity } from "./entities/story.entity";
import { StoryStatus } from "./enums/story.enum";
import { CreateStoryDto } from "./dto/create-story.dto";
import { EntityName } from "src/common/enums/entity.enum";
import { UserEntity } from "../user/entities/user.entity";
import { PostService } from "../post/services/post.service";
import { HashtagService } from "../hashtag/hashtag.service";
import { StoryLikeEntity } from "./entities/story-like.entity";
import { AuthMessage, NotFoundMessage, PublicMessage } from "src/common/enums/message.enum";
import { CreateCommentStoryDto } from "./dto/comment-story.dto";
import { StoryCommentEntity } from "./entities/story-comment.entity";
import { StoryViewEntity } from "./entities/story-view.entity";

@Injectable({ scope: Scope.REQUEST })
export class StoryService {
	constructor(
		@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
		@InjectRepository(StoryEntity) private storyRepository: Repository<StoryEntity>,
		@InjectRepository(StoryLikeEntity) private storyLikeRepository: Repository<StoryLikeEntity>,
		@InjectRepository(StoryViewEntity) private storyViewRepository: Repository<StoryViewEntity>,
		@InjectRepository(StoryCommentEntity)
		private storyCommentRepository: Repository<StoryCommentEntity>,
		@Inject(REQUEST) private request: Request,
		private hashtagService: HashtagService,
		private postService: PostService,
	) {}

	async newStory(file: Express.Multer.File, createStoryDto: CreateStoryDto) {
		if (file) createStoryDto.media = file?.path?.slice(7);

		const { id: userId } = this.request.user;
		let user = await this.userRepository.findOneBy({ id: userId });
		if (!user) throw new NotFoundException(NotFoundMessage.NotFoundUser);

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

	async findAllStoryUser() {
		const { id } = this.request.user;
		const story = await this.storyRepository.find({
			where: { userId: id, storyStatus: Not(StoryStatus.Deleted) },
			relations: ["comments", "viewsStory", "likesStory", "reactions"],
		});
		return { message: PublicMessage.Successfuly, story };
	}

	async showStoryDeleted() {
		const { id } = this.request.user;
		const story = await this.storyRepository.find({
			where: { userId: id, storyStatus: StoryStatus.Deleted },
			relations: ["comments", "viewsStory", "likesStory", "reactions"],
		});
		return { message: PublicMessage.Successfuly, story };
	}

	async showStoryToFollowers(userId: number) {
		const story = await this.storyRepository
			.createQueryBuilder(EntityName.Story)
			.where({ userId: userId, storyStatus: StoryStatus.Published })
			.select([
				"story.id",
				"story.mediaUrl",
				"story.mediaType",
				"story.caption",
				"story.tags",
				"story.mention",
				"story.location",
				"story.isComment",
			])
			.loadRelationCountAndMap("story.likesStory", "story.likesStory")
			.getMany();

		for (let i = 0; i < story.length; i++) {
			const viewed = await this.storyViewRepository.findOneBy({
				userId: this.request.user.id,
				storyId: story[i].id,
			});
			if (!viewed) {
				await this.storyViewRepository.insert({
					userId: this.request.user.id,
					storyId: story[i].id,
				});
			}
		}

		return { message: PublicMessage.Successfuly, story };
	}

	async saveCommentStory(createCommentStoryDto: CreateCommentStoryDto) {
		const { id: userId } = this.request.user;
		const { text, storyId } = createCommentStoryDto;

		await this.postService.checkExistPostById(storyId);
		await this.storyCommentRepository.insert({
			userId,
			storyId,
			text: await this.hashtagService.createHashTag(text),
		});
		return { message: PublicMessage.CreatedComment };
	}

	async likeToggle(storyId: number) {
		const { id: userId } = this.request.user;
		await this.checkExistStoryById(storyId);
		const isLiked = await this.storyLikeRepository.findOneBy({ userId, storyId });
		let message = PublicMessage.LikeStory;
		if (isLiked) {
			await this.storyLikeRepository.delete({ id: isLiked.id });
			message = PublicMessage.DisLikeStory;
		} else {
			await this.storyLikeRepository.insert({ storyId, userId });
		}
		return { message };
	}

	async remove(storyId: number) {
		const { id: userId } = this.request.user;
		const story = await this.storyRepository.findOneBy({ id: storyId });
		if (!story) throw new NotFoundException(NotFoundMessage.NotFoundStory);
		if (story.userId === userId) throw new ForbiddenException(AuthMessage.Forbidden);

		await this.storyRepository.remove(story);
		return { message: PublicMessage.Deleted, story };
	}

	async checkExistStoryById(id: number) {
		const story = await this.storyRepository.findOneBy({ id });
		if (!story) throw new NotFoundException(NotFoundMessage.NotFoundStory);
		return story;
	}
}
