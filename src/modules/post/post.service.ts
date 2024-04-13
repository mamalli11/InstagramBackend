import * as fs from "fs";
import { Request } from "express";
import { Repository } from "typeorm";
import { REQUEST } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { BadRequestException, ForbiddenException, Inject, Injectable, Scope } from "@nestjs/common";

import { PostMediasType } from "./types/files";
import { PostEntity } from "./entities/post.entity";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { MediaEntity } from "./entities/media.entity";
import { UserEntity } from "../user/entities/user.entity";
import { AuthMessage, NotFoundMessage, PublicMessage } from "src/common/enums/message.enum";
import { join } from "path";

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
		const { caption, type, status } = createPostDto;
		let post = await this.postRepository.save(
			this.postRepository.create({ caption, status, type, userId: id }),
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

	async update(postid: number, updatePostDto: UpdatePostDto) {
		const { id: userId } = this.request.user;
		const { caption, status } = updatePostDto;

		let post = await this.postRepository.findOneBy({ id: postid });
		if (!post) throw new BadRequestException(NotFoundMessage.NotFoundPost);
		if (post.userId !== userId) throw new ForbiddenException(AuthMessage.Forbidden);

		if (post) {
			if (caption) post.caption = caption;
			if (status) post.status = status;
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
}
