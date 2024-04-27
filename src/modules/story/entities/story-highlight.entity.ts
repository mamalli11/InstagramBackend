import { Column, CreateDateColumn, Entity, OneToMany, OneToOne } from "typeorm";

import { StoryEntity } from "./story.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";

@Entity(EntityName.StoryHighlight)
export class StoryHighlightEntity extends BaseEntity {
	@Column()
	userId: number;
	@OneToOne(() => UserEntity, (user) => user.story_highlights, { onDelete: "CASCADE" })
	user: UserEntity;

	@Column()
	title: string;

	@Column()
	coverImageUrl: string;

	@Column()
	storyId: number;
	@OneToMany(() => StoryEntity, (story) => story.highlights)
	story: StoryEntity[];

	@CreateDateColumn()
	created_at: Date;
}
