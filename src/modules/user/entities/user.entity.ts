import {
	Entity,
	Column,
	OneToOne,
	OneToMany,
	JoinColumn,
	CreateDateColumn,
	UpdateDateColumn,
} from "typeorm";

import { OtpEntity } from "./otp.entity";
import { BlockEntity } from "./block.entity";
import { FollowEntity } from "./follow.entity";
import { ProfileEntity } from "./profile.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { FollowRequestEntity } from "./follow-requst.entity";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { PostEntity } from "src/modules/post/entities/post.entity";
import { StoryEntity } from "src/modules/story/entities/story.entity";
import { PostLikeEntity } from "src/modules/post/entities/postLike.entity";
import { PostCommentEntity } from "src/modules/post/entities/comment.entity";
import { PostBookmarkEntity } from "src/modules/post/entities/bookmark.entity";
import { StoryLikeEntity } from "src/modules/story/entities/story-like.entity";
import { StoryCommentEntity } from "src/modules/story/entities/story-comment.entity";
import { PostCommentLikeEntity } from "src/modules/post/entities/postCommentLike.entity";
import { StoryHighlightEntity } from "src/modules/story/entities/story-highlight.entity";

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

	@Column({ nullable: true })
	passwordChangeAt: Date;

	@Column({ default: false })
	is_private: boolean;

	@Column({ default: false })
	is_verified: boolean;

	@Column({ default: true })
	is_otp: boolean;

	@Column({ default: true })
	is_Post_Comment: boolean;
	
	@Column({ default: true })
	is_Story_Comment: boolean;

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

	@OneToMany(() => PostEntity, (post) => post.user)
	posts: PostEntity[];

	@OneToMany(() => PostLikeEntity, (like) => like.user)
	post_likes: PostLikeEntity[];

	@OneToMany(() => PostCommentLikeEntity, (like) => like.user)
	post_comment_likes: PostCommentLikeEntity[];

	@OneToMany(() => PostBookmarkEntity, (bookmark) => bookmark.user)
	post_bookmarks: PostBookmarkEntity[];

	@OneToMany(() => PostCommentEntity, (comment) => comment.user)
	post_comments: PostCommentEntity[];

	@OneToMany(() => BlockEntity, (block) => block.user)
	blocklist: BlockEntity[];

	@Column({ nullable: true })
	StoryId: number;
	@OneToMany(() => StoryEntity, (Story) => Story.user)
	@JoinColumn({ name: "StoryId" })
	storys: StoryEntity[];

	@OneToMany(() => StoryLikeEntity, (like) => like.user)
	story_likes: StoryLikeEntity[];

	@OneToMany(() => StoryCommentEntity, (comment) => comment.user)
	story_comments: StoryCommentEntity[];

	@OneToMany(() => StoryHighlightEntity, (highlight) => highlight.user)
	story_highlights: StoryHighlightEntity[];

	@OneToMany(() => FollowEntity, (follow) => follow.following)
	followers: FollowEntity[];

	@OneToMany(() => FollowEntity, (follow) => follow.follower)
	following: FollowEntity[];

	@OneToMany(() => FollowRequestEntity, (follow) => follow.user)
	requestedFollow: FollowRequestEntity[];

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}
