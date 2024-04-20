import { Request } from "express";
import { REQUEST } from "@nestjs/core";
import { IsNull, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Inject, Injectable, NotFoundException, Scope, forwardRef } from "@nestjs/common";

import { PostService } from "./post.service";
import { PostEntity } from "../entities/post.entity";
import { CreateCommentDto } from "../dto/comment.dto";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { PostCommentEntity } from "../entities/comment.entity";
import { paginationGenerator, paginationSolver } from "src/common/utils/pagination.util";
import { BadRequestMessage, NotFoundMessage, PublicMessage } from "src/common/enums/message.enum";
import { PostCommentLikeEntity } from "../entities/postCommentLike.entity";

@Injectable({ scope: Scope.REQUEST })
export class PostCommentService {
	constructor(
		@InjectRepository(PostEntity) private postRepository: Repository<PostEntity>,
		@InjectRepository(PostCommentLikeEntity)
		private postCommentLikeEntity: Repository<PostCommentLikeEntity>,
		@InjectRepository(PostCommentEntity)
		private postCommentRepository: Repository<PostCommentEntity>,
		@Inject(REQUEST) private request: Request,
		@Inject(forwardRef(() => PostService)) private postService: PostService,
	) {}

	async create(commentDto: CreateCommentDto) {
		const { parentId, text, postId } = commentDto;
		const { id: userId } = this.request.user;
		await this.postService.checkExistPostById(postId);
		let parent = null;
		if (parentId && !isNaN(parentId)) {
			parent = await this.postCommentRepository.findOneBy({ id: +parentId });
		}
		await this.postCommentRepository.insert({
			text,
			postId,
			parentId: parent ? parentId : null,
			userId,
		});
		return {
			message: PublicMessage.CreatedComment,
		};
	}
	async find(paginationDto: PaginationDto) {
		const { limit, page, skip } = paginationSolver(paginationDto);
		const [comments, count] = await this.postCommentRepository.findAndCount({
			where: {},
			relations: {
				post: true,
				likes: true,
				user: { profile: true },
			},
			select: {
				post: { caption: true },
				likes: { userId: true },
				user: {
					username: true,
					profile: { fullname: true },
				},
			},
			skip,
			take: limit,
			order: { id: "DESC" },
		});
		return {
			pagination: paginationGenerator(count, page, limit),
			comments,
		};
	}
	async findCommentsOfPost(postId: number, paginationDto: PaginationDto) {
		const { limit, page, skip } = paginationSolver(paginationDto);
		const [comments, count] = await this.postCommentRepository.findAndCount({
			where: { postId, parentId: IsNull() },
			relations: {
				user: { profile: true },
				children: {
					user: { profile: true },
					children: { user: { profile: true } },
				},
			},
			select: {
				user: {
					username: true,
					profile: { fullname: true },
				},
				children: {
					text: true,
					created_at: true,
					parentId: true,
					user: {
						username: true,
						profile: { fullname: true },
					},
					children: {
						text: true,
						created_at: true,
						parentId: true,
						user: {
							username: true,
							profile: { fullname: true },
						},
					},
				},
			},
			skip,
			take: limit,
			order: { id: "DESC" },
		});
		return {
			pagination: paginationGenerator(count, page, limit),
			comments,
		};
	}
	async likeComment(commentId: number) {
		const { id: userId } = this.request.user;
		await this.checkExistById(commentId);
		const isLiked = await this.postCommentLikeEntity.findOneBy({ userId, commentId });
		let message = PublicMessage.LikeComment;
		if (isLiked) {
			await this.postCommentLikeEntity.delete({ id: isLiked.id });
			message = PublicMessage.DisLikeComment;
		} else {
			await this.postCommentLikeEntity.insert({ commentId, userId });
		}
		return { message };
	}

	async checkExistById(id: number) {
		const comment = await this.postCommentRepository.findOneBy({ id });
		if (!comment) throw new NotFoundException(NotFoundMessage.NotFound);
		return comment;
	}
}
