import * as fs from "fs";
import { Request } from "express";
import { Repository } from "typeorm";
import { REQUEST } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import {
	Scope,
	Inject,
	Injectable,
	NotFoundException,
	ForbiddenException,
	BadRequestException,
} from "@nestjs/common";

import { PostMediasType } from "./types/files";
import { FilterPostDto } from "./dto/filter.dto";
import { PostEntity } from "./entities/post.entity";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { MediaEntity } from "./entities/media.entity";
import { UserEntity } from "../user/entities/user.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { PostLikeEntity } from "./entities/postLike.entity";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { PostBookmarkEntity } from "./entities/bookmark.entity";
import { paginationGenerator, paginationSolver } from "src/common/utils/pagination.util";
import { AuthMessage, NotFoundMessage, PublicMessage } from "src/common/enums/message.enum";

@Injectable({ scope: Scope.REQUEST })
export class PostService {
	constructor(
		@InjectRepository(PostEntity) private postRepository: Repository<PostEntity>,
		@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
		@InjectRepository(MediaEntity) private mediaRepository: Repository<MediaEntity>,
		@InjectRepository(PostLikeEntity) private postLikeRepository: Repository<PostLikeEntity>,
		@InjectRepository(PostBookmarkEntity)
		private postBookmarkRepository: Repository<PostBookmarkEntity>,
		@Inject(REQUEST) private request: Request,
	) {}
	async create(files: PostMediasType, createPostDto: CreatePostDto) {
		const { id } = this.request.user;
		const { caption, type, mention, status, isComment } = createPostDto;

		let post = await this.postRepository.save(
			this.postRepository.create({
				type,
				status,
				caption,
				isComment,
				userId: id,
				mention: this.convertToArray(mention),
			}),
		);

		if (type === "album" && files) {
			Object.keys(files).map(async (k) => {
				await this.mediaRepository.save(
					this.mediaRepository.create({
						type: files[k][0].mimetype === "video/mp4" ? "video" : "image",
						url: files[k][0].path,
						postId: post.id,
					}),
				);
			});
		} else {
			await this.mediaRepository.save(
				this.mediaRepository.create({
					type: files.media1[0].mimetype === "video/mp4" ? "video" : "image",
					url: files.media1[0].path,
					postId: post.id,
				}),
			);
		}
		return { message: PublicMessage.Created, post };
	}

	async findAllPostsUser() {
		const { id } = this.request.user;
		const Posts = await this.postRepository.find({
			where: { userId: id },
			relations: { media: true },
			order: { id: "DESC" },
		});
		return { message: PublicMessage.Successfuly, Posts };
	}

	async findAllUserPosts(username: string) {
		const { id, is_private } = await this.userRepository.findOneBy({ username });

		// if (is_private) {
		// 		check follow user
		// }

		const Posts = await this.postRepository.find({
			where: { userId: id, status: "published" },
			select: ["id", "type", "media"],
			relations: { media: true },
			order: { id: "DESC" },
		});
		return { message: PublicMessage.Successfuly, Posts };
	}

	async findOne(postid: number, paginationDto: PaginationDto) {
		const userId = this.request?.user?.id;
		const post = await this.postRepository
			.createQueryBuilder(EntityName.Post)
			.leftJoin("post.user", "user")
			.leftJoin("user.profile", "profile")
			.addSelect(["user.username", "user.id", "profile.fullName"])
			.where({ id: postid })
			.loadRelationCountAndMap("post.likes", "post.likes")
			.loadRelationCountAndMap("post.bookmarks", "post.bookmarks")
			.getOne();
		if (!post) throw new NotFoundException(NotFoundMessage.NotFoundPost);
		// const commentsData = await this.blogCommentService.findCommentsOfBlog(blog.id, paginationDto);
		const isLiked = !!(await this.postLikeRepository.findOneBy({ userId, postId: post.id }));
		const isBookmarked = !!(await this.postBookmarkRepository.findOneBy({
			userId,
			postId: post.id,
		}));
		return {
			post,
			isLiked,
			isBookmarked,
			// commentsData,
		};
	}

	async postList(paginationDto: PaginationDto, filterDto: FilterPostDto) {
		const { limit, page, skip } = paginationSolver(paginationDto);
		let { search } = filterDto;
		let where = "";

		const [posts, count] = await this.postRepository
			.createQueryBuilder(EntityName.Post)
			.leftJoin("post.user", "user")
			.leftJoin("user.profile", "profile")
			.addSelect(["user.username", "user.id", "profile.fullname"])
			.where(where, { search })
			.loadRelationCountAndMap("post.likes", "post.likes")
			.loadRelationCountAndMap("post.bookmarks", "post.bookmarks")
			.loadRelationCountAndMap("post.comments", "post.comments")
			.orderBy("post.id", "DESC")
			.skip(skip)
			.take(limit)
			.getManyAndCount();

		return { pagination: paginationGenerator(count, page, limit), posts };
	}

	async update(postid: number, updatePostDto: UpdatePostDto) {
		const { id: userId } = this.request.user;
		const { caption, status, mention, isComment } = updatePostDto;

		let post = await this.postRepository.findOneBy({ id: postid });
		if (!post) throw new BadRequestException(NotFoundMessage.NotFoundPost);
		if (post.userId !== userId) throw new ForbiddenException(AuthMessage.Forbidden);

		if (post) {
			if (status) post.status = status;
			if (caption) post.caption = caption;
			if (isComment) post.isComment = isComment;
			if (mention) post.mention = this.convertToArray(mention);

			post = await this.postRepository.save(post);
		}

		return { message: PublicMessage.Updated };
	}

	async remove(postid: number) {
		const { id: userId } = this.request.user;

		let post = await this.postRepository.findOne({
			where: { id: postid },
			relations: { media: true },
		});
		if (!post) throw new BadRequestException(NotFoundMessage.NotFoundPost);
		if (post.userId !== userId) throw new ForbiddenException(AuthMessage.Forbidden);

		// delete media
		post.media.map(async (item) => {
			fs.unlink(item.url, (err) => {
				if (err) {
					console.error(err);
					throw err;
				}
			});
		});

		await this.postRepository.delete({ id: postid });

		return { message: PublicMessage.Deleted };
	}

	async likeToggle(postId: number) {
		const { id: userId } = this.request.user;
		await this.checkExistPostById(postId);
		const isLiked = await this.postLikeRepository.findOneBy({ userId, postId });
		let message = PublicMessage.Like;
		if (isLiked) {
			await this.postLikeRepository.delete({ id: isLiked.id });
			message = PublicMessage.DisLike;
		} else {
			await this.postLikeRepository.insert({ postId, userId });
		}
		return { message };
	}

	async bookmarkToggle(postId: number) {
		const { id: userId } = this.request.user;
		await this.checkExistPostById(postId);
		const isBookmarked = await this.postBookmarkRepository.findOneBy({ userId, postId });
		let message = PublicMessage.Bookmark;
		if (isBookmarked) {
			await this.postBookmarkRepository.delete({ id: isBookmarked.id });
			message = PublicMessage.UnBookmark;
		} else {
			await this.postBookmarkRepository.insert({ postId, userId });
		}
		return { message };
	}

	convertToArray(data: string[]): Array<string> {
		const arrayData = data.toString().split(",");
		const mention = arrayData.map((value) => value.trim());
		return mention;
	}

	async checkExistPostById(id: number) {
		const post = await this.postRepository.findOneBy({ id });
		if (!post) throw new NotFoundException(NotFoundMessage.NotFoundPost);
		return post;
	}
}
