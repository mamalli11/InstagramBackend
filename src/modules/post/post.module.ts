import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { PostService } from "./post.service";
import { AuthModule } from "../auth/auth.module";
import { PostController } from "./post.controller";
import { PostEntity } from "./entities/post.entity";
import { MediaEntity } from "./entities/media.entity";
import { UserEntity } from "../user/entities/user.entity";
import { PostLikeEntity } from "./entities/postLike.entity";
import { PostBookmarkEntity } from "./entities/bookmark.entity";

@Module({
	imports: [
		AuthModule,
		TypeOrmModule.forFeature([
			PostEntity,
			MediaEntity,
			UserEntity,
			PostLikeEntity,
			PostBookmarkEntity,
		]),
	],
	controllers: [PostController],
	providers: [PostService],
})
export class PostModule {}
