import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";

import { EntityName } from "src/common/enums/entity.enum";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { PostCommentLikeEntity } from "./postCommentLike.entity";
import { PostEntity } from "src/modules/post/entities/post.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";

@Entity(EntityName.PostComment)
export class PostCommentEntity extends BaseEntity {
	@Column()
	text: string;

	@OneToMany(() => PostCommentLikeEntity, (like) => like.postComment)
	likes: PostCommentLikeEntity[];

	@Column()
	userId: number;
	@ManyToOne(() => UserEntity, (user) => user.post_comments, { onDelete: "CASCADE" })
	user: UserEntity;

	@Column()
	postId: number;
	@ManyToOne(() => PostEntity, (post) => post.comments, { onDelete: "CASCADE" })
	post: PostEntity;

	@Column({ nullable: true })
	parentId: number;
	@ManyToOne(() => PostCommentEntity, (parent) => parent.children, { onDelete: "CASCADE" })
	parent: PostCommentEntity;

	@OneToMany(() => PostCommentEntity, (comment) => comment.parent)
	@JoinColumn({ name: "parent" })
	children: PostCommentEntity[];

	@CreateDateColumn()
	created_at: Date;
}
