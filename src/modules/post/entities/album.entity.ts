import { Column, CreateDateColumn, Entity, OneToOne, UpdateDateColumn } from "typeorm";

import { PostEntity } from "./post.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { BaseEntity } from "src/common/abstracts/base.entity";

@Entity(EntityName.Album)
export class AlbumEntity extends BaseEntity {
	@OneToOne(() => PostEntity, (post) => post.album, { onDelete: "CASCADE" })
	post: PostEntity;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}
