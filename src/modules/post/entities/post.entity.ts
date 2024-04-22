import {
	Column,
	Entity,
	ManyToOne,
	OneToMany,
	CreateDateColumn,
	UpdateDateColumn,
} from "typeorm";

import { MediaEntity } from "./media.entity";
import { PostStatus } from "../enums/post.enum";
import { PostLikeEntity } from "./postLike.entity";
import { PostCommentEntity } from "./comment.entity";
import { PostBookmarkEntity } from "./bookmark.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";
  
@Entity(EntityName.Post)
export class PostEntity extends BaseEntity {
	@Column()
	caption: string;

	@Column({ type: "enum", enum: ["image", "video", "album"] })
	type: string;

	@Column({ default: PostStatus.Published })
	status: string;

	@Column("text", { array: true, nullable: true })
	mention: string[];

	@Column()
	userId: number;
	@ManyToOne(() => UserEntity, (user) => user.posts, { onDelete: "CASCADE" })
	user: UserEntity;

	@Column("boolean")
	isComment: boolean;

	@OneToMany(() => PostCommentEntity, (comment) => comment.post)
	comments: PostCommentEntity[];

	@OneToMany(() => PostLikeEntity, (like) => like.post)
	likes: PostLikeEntity[];

	@OneToMany(() => PostBookmarkEntity, (bookmark) => bookmark.post)
	bookmarks: PostBookmarkEntity[]; 

	@OneToMany(() => MediaEntity, (media) => media.post)
	media: MediaEntity[];

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}
