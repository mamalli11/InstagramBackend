import {
	Entity,
	Column,
	ManyToOne,
	OneToMany,
	ManyToMany,
	JoinColumn,
	CreateDateColumn,
} from "typeorm";

import { StoryLikeEntity } from "./story-like.entity";
import { StoryViewEntity } from "./story-view.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { StoryCommentEntity } from "./story-comment.entity";
import { StoryType, StoryStatus } from "../enums/story.enum";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { StoryReactionEntity } from "./story-reaction.entity";
import { StoryHighlightEntity } from "./story-highlight.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";

@Entity(EntityName.Story)
export class StoryEntity extends BaseEntity {
	@Column()
	userId: number;
	@ManyToOne(() => UserEntity, (user) => user.storys, { onDelete: "CASCADE" })
	@JoinColumn({ name: "userId" })
	user: UserEntity;

	@Column()
	mediaUrl: string;

	@Column({ type: "enum", enum: StoryType, default: StoryType.Image })
	mediaType: StoryType;

	@Column({ type: "enum", enum: StoryStatus, default: StoryStatus.Published })
	storyStatus: StoryStatus;

	@Column({ nullable: true })
	caption: string;

	@Column("text", { array: true, nullable: true })
	mention: string[];

	@Column("text", { array: true, nullable: true })
	location: string[];

	@Column("text", { array: true, nullable: true })
	tags: string[];

	@Column({ default: false })
	isSeen: boolean;

	@Column({ default: false })
	isPinned: boolean;

	@Column({ default: true })
	isComment: boolean;

	@Column({ default: 0 })
	views: number;

	@Column({ default: 0 })
	likes: number;

	@CreateDateColumn()
	created_at: Date;

	@OneToMany(() => StoryCommentEntity, (comment) => comment.story)
	comments: StoryCommentEntity[];

	@OneToMany(() => StoryViewEntity, (view) => view.story)
	viewsStory: StoryViewEntity[];

	@OneToMany(() => StoryLikeEntity, (like) => like.story)
	likesStory: StoryLikeEntity[];

	@ManyToMany(() => StoryHighlightEntity, (highlight) => highlight.story)
	highlights: StoryHighlightEntity[];

	@OneToMany(() => StoryReactionEntity, (reaction) => reaction.story)
	reactions: StoryReactionEntity[];
}
