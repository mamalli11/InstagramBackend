import { Column, CreateDateColumn, Entity, ManyToOne, UpdateDateColumn } from "typeorm";

import { EntityName } from "src/common/enums/entity.enum";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { PostEntity } from "src/modules/post/entities/post.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";

@Entity(EntityName.Comment)
export class CommentEntity extends BaseEntity {
	@Column()
	content: string;

	@ManyToOne(() => UserEntity, (user) => user.comments, { onDelete: "CASCADE" })
	user: UserEntity;

	@ManyToOne(() => PostEntity, (post) => post.comments, { onDelete: "CASCADE" })
	post: PostEntity;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}
