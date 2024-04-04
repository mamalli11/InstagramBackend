import { BaseEntity } from "src/common/abstracts/base.entity";
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { OtpEntity } from "./otp.entity";

@Entity()
export class UserEntity extends BaseEntity {
	@Column({ unique: true })
	username: string;

	@Column({ unique: true, nullable: true })
	email: string;

	@Column({ unique: true, nullable: true })
	phone: string;

	@Column()
	password: string;

	@Column({ default: false })
	is_private: boolean;

	@Column({ default: false })
	is_verified: boolean;

    otpId: number;
	@OneToOne(() => OtpEntity, (otp) => otp.user, { nullable: true })
	@JoinColumn()
	otp: OtpEntity;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;

	// @OneToMany(() => Post, (post) => post.user)
	// posts: Post[];

	// @OneToMany(() => Follow, (follow) => follow.follower)
	// followers: Follow[];

	// @OneToMany(() => Follow, (follow) => follow.following)
	// following: Follow[];
}
