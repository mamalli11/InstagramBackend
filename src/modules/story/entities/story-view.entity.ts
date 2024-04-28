import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";

import { StoryEntity } from "./story.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";

@Entity(EntityName.StoryView)
export class StoryViewEntity extends BaseEntity {
	@Column()
	storyId: number;

	@Column()
	userId: number;

	@ManyToOne(() => UserEntity, (user) => user.id)
	@JoinColumn({ name: "userId" })
	user: UserEntity;

	@ManyToOne(() => StoryEntity, (story) => story.viewsStory, { onDelete: "CASCADE" })
	@JoinColumn({ name: "storyId" })
	story: StoryEntity;

	@CreateDateColumn()
	created_at: Date;
}
