import { Column, Entity, OneToOne } from "typeorm";

import { PostEntity } from "./post.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { BaseEntity } from "src/common/abstracts/base.entity";

@Entity(EntityName.Album)
export class AlbumEntity extends BaseEntity {
	@OneToOne(() => PostEntity, (post) => post.album)
	post: PostEntity;

	@Column()
	created_at: Date;

	@Column()
	updated_at: Date;
}
