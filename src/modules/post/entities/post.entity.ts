import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	OneToOne,
	UpdateDateColumn,
} from "typeorm";

import { MediaEntity } from "./media.entity";
import { AlbumEntity } from "./album.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { CommentEntity } from "src/modules/comment/entities/comment.entity";

@Entity(EntityName.Post)
export class PostEntity extends BaseEntity {
	@Column()
	caption: string;

	@Column({ type: "enum", enum: ["image", "video", "album"] })
	type: string;

	@ManyToOne(() => UserEntity, (user) => user.posts, { onDelete: "CASCADE" })
	user: UserEntity;

	@Column({ nullable: true })
	commentId: number;
	@OneToMany(() => CommentEntity, (comment) => comment.post)
	@JoinColumn({ name: "commentId" })
	comments: CommentEntity[];

	// @OneToMany(() => Like, like => like.post)
	// likes: Like[];

	@Column({ nullable: true })
	mediaId: number;
	@OneToMany(() => MediaEntity, (media) => media.post)
	@JoinColumn({ name: "mediaId" })
	media: MediaEntity[];

	@Column({ nullable: true })
	albumId: number;
	@OneToOne(() => AlbumEntity, (album) => album.post)
	@JoinColumn({ name: "albumId" })
	album: AlbumEntity;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}
