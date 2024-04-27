import { Column, CreateDateColumn, Entity, OneToMany, OneToOne } from "typeorm";

import { StoryEntity } from "./story.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";

@Entity(EntityName.StoryReaction)
export class StoryReactionEntity extends BaseEntity {
	@Column()
	userId: number;
	@OneToOne(() => UserEntity, (user) => user.id, { onDelete: "CASCADE" })
	user: UserEntity;

	@Column()
	storyId: number;
	@OneToOne(() => StoryEntity, (story) => story.reactions, { onDelete: "CASCADE" })
	story: StoryEntity[];

	@Column({ type: "enum", enum: ["like", "heart", "fire", "laugh", "sad", "wow"] })
	reactionType: string;

	@CreateDateColumn()
	created_at: Date;
}
