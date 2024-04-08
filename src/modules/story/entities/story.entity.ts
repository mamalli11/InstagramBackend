import { Column, CreateDateColumn, Entity, ManyToOne } from "typeorm";

import { EntityName } from "src/common/enums/entity.enum";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";

@Entity(EntityName.Story)
export class StoryEntity extends BaseEntity {
	@Column()
	content: string;

	@Column({ type: "enum", enum: ["image", "video"] })
	type: string;

	@Column({})
	duration: number; // in seconds

	@ManyToOne(() => UserEntity, (user) => user.stories)
	user: UserEntity;

	@CreateDateColumn()
	created_at: Date;
}
