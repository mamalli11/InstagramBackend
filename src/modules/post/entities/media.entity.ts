import { AfterLoad, Column, CreateDateColumn, Entity, ManyToOne, UpdateDateColumn } from "typeorm";

import { PostEntity } from "./post.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { BaseEntity } from "src/common/abstracts/base.entity";

@Entity(EntityName.Media)
export class MediaEntity extends BaseEntity {
	@Column({ type: "enum", enum: ["image", "video"], default: "image" })
	type: string;

	@Column()
	url: string;

	@Column()
	postId: number;
	@ManyToOne(() => PostEntity, (post) => post.media, { onDelete: "CASCADE" })
	post: PostEntity;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;

	@AfterLoad()
	map() {
		const URL = this.url.replaceAll("\\", "/");
		this.url = `${process.env.URL}/${URL}`;
	}
}
