import { Column, CreateDateColumn, Entity } from "typeorm";

import { EntityName } from "src/common/enums/entity.enum";
import { BaseEntity } from "src/common/abstracts/base.entity";

@Entity(EntityName.Hashtag)
export class HashtagEntity extends BaseEntity {
	@Column({ unique: true })
	name: string;

	@CreateDateColumn()
	created_at: Date;
}
