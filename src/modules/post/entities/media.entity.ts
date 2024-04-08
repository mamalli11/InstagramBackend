import { Column, CreateDateColumn, Entity, ManyToOne, UpdateDateColumn } from "typeorm";

import { PostEntity } from "./post.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { BaseEntity } from "src/common/abstracts/base.entity";

@Entity(EntityName.Media)
export class MediaEntity extends BaseEntity {
	@Column({ type: "enum", enum: ["image", "video"] })
	type: string;

	@Column()
	url: string;

	@ManyToOne(() => PostEntity, (post) => post.media, { onDelete: "CASCADE" })
	post: PostEntity;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}
