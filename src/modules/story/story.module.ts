import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { StoryService } from "./story.service";
import { PostModule } from "../post/post.module";
import { AuthModule } from "../auth/auth.module";
import { StoryController } from "./story.controller";
import { StoryEntity } from "./entities/story.entity";
import { HashtagModule } from "../hashtag/hashtag.module";
import { UserEntity } from "../user/entities/user.entity";
import { StoryLikeEntity } from "./entities/story-like.entity";
import { StoryViewEntity } from "./entities/story-view.entity";
import { StoryCommentEntity } from "./entities/story-comment.entity";
import { StoryReactionEntity } from "./entities/story-reaction.entity";
import { StoryHighlightEntity } from "./entities/story-highlight.entity";

@Module({
	imports: [
		AuthModule,
		PostModule,
		HashtagModule,
		TypeOrmModule.forFeature([
			UserEntity,
			StoryEntity,
			StoryLikeEntity,
			StoryViewEntity,
			StoryCommentEntity,
			StoryReactionEntity,
			StoryHighlightEntity,
		]),
	],
	controllers: [StoryController],
	providers: [StoryService],
})
export class StoryModule {}
