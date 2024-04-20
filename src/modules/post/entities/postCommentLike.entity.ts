import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne } from "typeorm";

import { PostCommentEntity } from "./comment.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { UserEntity } from "../../user/entities/user.entity";
import { BaseEntity } from "src/common/abstracts/base.entity";

@Entity(EntityName.PostCommentLike)
export class PostCommentLikeEntity extends BaseEntity {
	@Column()
	commentId: number;

	@Column()
	userId: number;

	@ManyToOne(() => UserEntity, (user) => user.post_likes, { onDelete: "CASCADE" })
	user: UserEntity;

	@ManyToOne(() => PostCommentEntity, (comment) => comment.likes, { onDelete: "CASCADE" })
	@JoinColumn({ name: "commentId" })
	postComment: PostCommentEntity;

	@CreateDateColumn()
	created_at: Date;
}
