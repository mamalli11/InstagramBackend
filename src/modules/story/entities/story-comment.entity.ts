import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne } from "typeorm";

import { StoryEntity } from "./story.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";

@Entity(EntityName.StoryComment)
export class StoryCommentEntity extends BaseEntity {
	@Column()
	storyId: number;

	@Column()
	userId: number;

	@Column()
	text: string;

	@ManyToOne(() => UserEntity, (user) => user.story_comments, { onDelete: "CASCADE" })
	@JoinColumn({ name: "userId" })
	user: UserEntity;

	@ManyToOne(() => StoryEntity, (story) => story.comments, { onDelete: "CASCADE" })
	@JoinColumn({ name: "storyId" })
	story: StoryEntity;

	@CreateDateColumn()
	created_at: Date;
}
