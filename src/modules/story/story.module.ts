import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { StoryService } from "./story.service";
import { StoryController } from "./story.controller";
import { StoryEntity } from "./entities/story.entity";
import { StoryLikeEntity } from "./entities/story-like.entity";
import { StoryViewEntity } from "./entities/story-view.entity";
import { StoryCommentEntity } from "./entities/story-comment.entity";
import { StoryReactionEntity } from "./entities/story-reaction.entity";
import { StoryHighlightEntity } from "./entities/story-highlight.entity";

@Module({
	imports: [
		TypeOrmModule.forFeature([
			StoryEntity,
			StoryViewEntity,
			StoryCommentEntity,
			StoryReactionEntity,
			StoryLikeEntity,
			StoryHighlightEntity,
		]),
	],
	controllers: [StoryController],
	providers: [StoryService],
})
export class StoryModule {}
