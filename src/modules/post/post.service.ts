import * as fs from "fs";
import { Request } from "express";
import { Repository } from "typeorm";
import { REQUEST } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { BadRequestException, ForbiddenException, Inject, Injectable, Scope } from "@nestjs/common";

import { PostMediasType } from "./types/files";
import { FilterPostDto } from "./dto/filter.dto";
import { PostEntity } from "./entities/post.entity";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { MediaEntity } from "./entities/media.entity";
import { UserEntity } from "../user/entities/user.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { paginationGenerator, paginationSolver } from "src/common/utils/pagination.util";
import { AuthMessage, NotFoundMessage, PublicMessage } from "src/common/enums/message.enum";

@Injectable({ scope: Scope.REQUEST })
export class PostService {
	constructor(
		@InjectRepository(PostEntity) private postRepository: Repository<PostEntity>,
		@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
		@InjectRepository(MediaEntity) private mediaRepository: Repository<MediaEntity>,
		@Inject(REQUEST) private request: Request,
	) {}
	async create(files: PostMediasType, createPostDto: CreatePostDto) {
		const { id } = this.request.user;
		const { caption, type, mention, status } = createPostDto;

		let post = await this.postRepository.save(
			this.postRepository.create({
				caption,
				status,
				type,
				mention: this.convertToArray(mention),
				userId: id,
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

	async findOne(postid: number) {
		const Posts = await this.postRepository.find({
			where: { id: postid },
			relations: { media: true },
		});

		if (Posts.length < 1) throw new BadRequestException(NotFoundMessage.NotFoundPost);

		return { message: PublicMessage.Successfuly, Posts };
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
		const { caption, status, mention } = updatePostDto;

		let post = await this.postRepository.findOneBy({ id: postid });
		if (!post) throw new BadRequestException(NotFoundMessage.NotFoundPost);
		if (post.userId !== userId) throw new ForbiddenException(AuthMessage.Forbidden);

		if (post) {
			if (caption) post.caption = caption;
			if (status) post.status = status;
			if (mention) post.mention = this.convertToArray(mention);
			post = await this.postRepository.save(post);
		}

		return { message: PublicMessage.Updated };
	}
	convertToArray(data: string[]): Array<string> {
		const arrayData = data.toString().split(",");
		const mention = arrayData.map((value) => value.trim());
		return mention;
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
}
