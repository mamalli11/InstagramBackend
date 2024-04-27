import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToMany,
	ManyToOne,
	OneToMany,
} from "typeorm";

import { EntityName } from "src/common/enums/entity.enum";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { StoryHighlightEntity } from "./story-highlight.entity";
import { StoryReactionEntity } from "./story-reaction.entity";
import { StoryLikeEntity } from "./story-like.entity";
import { StoryViewEntity } from "./story-view.entity";
import { StoryCommentEntity } from "./story-comment.entity";

@Entity(EntityName.Story)
export class StoryEntity extends BaseEntity {
	@Column()
	userId: number;
	@ManyToOne(() => UserEntity, (user) => user.storys, { onDelete: "CASCADE" })
	@JoinColumn({ name: "userId" })
	user: UserEntity;

	@Column()
	mediaUrl: string;

	@Column({ type: "enum", enum: ["image", "video"] })
	mediaType: string;

	@Column({ type: "enum", enum: ["public", "closefriend"], default: "public" })
	storyStatus: string;

	@Column()
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

	@Column({ default: 0 })
	views: number;

	@Column({ default: 0 })
	likes: number;

	@CreateDateColumn()
	created_at: Date;

	@OneToMany(() => StoryCommentEntity, (comment) => comment.story)
	comments: StoryCommentEntity[];

	@OneToMany(() => StoryViewEntity, (view) => view.story)
	viewsDetails: StoryViewEntity[];

	@OneToMany(() => StoryLikeEntity, (like) => like.story)
	likesDetails: StoryLikeEntity[];

	@ManyToMany(() => StoryHighlightEntity, (highlight) => highlight.story)
	highlights: StoryHighlightEntity[];

	@OneToMany(() => StoryReactionEntity, (reaction) => reaction.story)
	reactions: StoryReactionEntity[];
}
