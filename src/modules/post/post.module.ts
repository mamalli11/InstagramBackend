import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthModule } from "../auth/auth.module";
import { PostEntity } from "./entities/post.entity";
import { MediaEntity } from "./entities/media.entity";
import { PostService } from "./services/post.service";
import { UserEntity } from "../user/entities/user.entity";
import { PostLikeEntity } from "./entities/postLike.entity";
import { PostCommentEntity } from "./entities/comment.entity";
import { PostController } from "./controllers/post.controller";
import { PostBookmarkEntity } from "./entities/bookmark.entity";
import { PostCommentService } from "./services/comment.service";
import { PostCommentController } from "./controllers/comment.controller";
import { PostCommentLikeEntity } from "./entities/postCommentLike.entity";

@Module({
	imports: [
		AuthModule,
		TypeOrmModule.forFeature([
			UserEntity,
			PostEntity,
			MediaEntity,
			PostLikeEntity,
			PostCommentEntity,
			PostBookmarkEntity,
			PostCommentLikeEntity,
		]),
	],
	controllers: [PostController, PostCommentController],
	providers: [PostService, PostCommentService],
})
export class PostModule {}
