import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	UpdateDateColumn,
} from "typeorm";

import { MediaEntity } from "./media.entity";
import { PostStatus } from "../enums/post.enum";
import { EntityName } from "src/common/enums/entity.enum";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { LikeEntity } from "src/modules/user/entities/like.entity";
import { CommentEntity } from "src/modules/comment/entities/comment.entity";

@Entity(EntityName.Post)
export class PostEntity extends BaseEntity {
	@Column()
	caption: string;

	@Column({ type: "enum", enum: ["image", "video", "album"] })
	type: string;

	@Column({ default: PostStatus.Published })
	status: string;

	@Column()
	userId: number;
	@ManyToOne(() => UserEntity, (user) => user.posts, { onDelete: "CASCADE" })
	user: UserEntity;
	
	@Column({ nullable: true })
	commentId: number;
	@OneToMany(() => CommentEntity, (comment) => comment.post)
	@JoinColumn({ name: "commentId" })
	comments: CommentEntity[];

	@Column({ nullable: true })
	likeId: number;
	@OneToMany(() => LikeEntity, (like) => like.post)
	@JoinColumn({ name: "likeId" })
	likes: LikeEntity[];

	@OneToMany(() => MediaEntity, (media) => media.post)
	media: MediaEntity[];

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}
