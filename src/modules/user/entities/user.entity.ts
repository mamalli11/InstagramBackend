import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	OneToMany,
	OneToOne,
	UpdateDateColumn,
} from "typeorm";

import { OtpEntity } from "./otp.entity";
import { ProfileEntity } from "./profile.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { PostEntity } from "src/modules/post/entities/post.entity";
import { CommentEntity } from "src/modules/comment/entities/comment.entity";
import { LikeEntity } from "./like.entity";

@Entity(EntityName.User)
export class UserEntity extends BaseEntity {
	@Column({ unique: true })
	username: string;

	@Column({ unique: true, nullable: true })
	email: string;

	@Column({ unique: true, nullable: true })
	phone: string;

	@Column({ select: false })
	password: string;

	@Column({ default: false })
	is_private: boolean;

	@Column({ default: false })
	is_verified: boolean;

	@Column({ default: true })
	is_otp: boolean;

	@Column({ nullable: true })
	otpId: number;
	@OneToOne(() => OtpEntity, (otp) => otp.user, { nullable: true })
	@JoinColumn()
	otp: OtpEntity;

	@Column({ nullable: true })
	profileId: number;
	@OneToOne(() => ProfileEntity, (profile) => profile.user, { nullable: true })
	@JoinColumn({ name: "profileId" })
	profile: ProfileEntity;

	@Column({ nullable: true })
	postId: number;
	@OneToMany(() => PostEntity, (post) => post.user)
	@JoinColumn({ name: "postId" })
	posts: PostEntity[];

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

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;

	// @OneToMany(() => Follow, (follow) => follow.follower)
	// followers: Follow[];

	// @OneToMany(() => Follow, (follow) => follow.following)
	// following: Follow[];
}
