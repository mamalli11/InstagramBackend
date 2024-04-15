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
import { StoryEntity } from "src/modules/story/entities/story.entity";
import { PostLikeEntity } from "src/modules/post/entities/postLike.entity";
import { PostCommentEntity } from "src/modules/post/entities/comment.entity";
import { PostBookmarkEntity } from "src/modules/post/entities/bookmark.entity";

@Entity(EntityName.User)
export class UserEntity extends BaseEntity {
	@Column({ unique: true })
	username: string;

	@Column({ unique: true, nullable: true })
	email: string;

	@Column({ unique: true, nullable: true })
	phone: string;

	@Column({ nullable: true })
	new_email: string;

	@Column({ nullable: true })
	new_phone: string;

	@Column({ nullable: true, default: false })
	verify_email: boolean;

	@Column({ nullable: true, default: false })
	verify_phone: boolean;

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

	@OneToMany(() => PostLikeEntity, (like) => like.user)
	post_likes: PostLikeEntity[];

	@OneToMany(() => PostBookmarkEntity, (bookmark) => bookmark.user)
	post_bookmarks: PostBookmarkEntity[];
	
	@OneToMany(() => PostCommentEntity, (comment) => comment.user)
	post_comments: PostCommentEntity[];

	@Column({ nullable: true })
	StoryId: number;
	@OneToMany(() => StoryEntity, (Story) => Story.user)
	@JoinColumn({ name: "StoryId" })
	stories: StoryEntity[];

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;

	// @OneToMany(() => Follow, (follow) => follow.follower)
	// followers: Follow[];

	// @OneToMany(() => Follow, (follow) => follow.following)
	// following: Follow[];
}
