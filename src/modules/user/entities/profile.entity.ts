import { Column, CreateDateColumn, Entity, OneToOne, UpdateDateColumn } from "typeorm";

import { UserEntity } from "./user.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { BaseEntity } from "src/common/abstracts/base.entity";

@Entity(EntityName.Profile)
export class ProfileEntity extends BaseEntity {
	@Column({ length: 50 })
	fullname: string;

	@Column({ nullable: true, length: 150 })
	bio: string;

	@Column({ default: "/default/avatar-default.png" })
	profile_picture: string;

	@Column({ nullable: true })
	website: string;

	@Column({ default: "other", enum: ["male", "female", "other"] })
	gender: string;

	@Column({ nullable: true })
	birthday: Date;

	@Column({ nullable: true })
	country: string;

	@Column({ default: "en" })
	language: string;

	@Column({ nullable: true })
	userId: number;
	@OneToOne(() => UserEntity, (user) => user.profile, { onDelete: "CASCADE" })
	user: UserEntity;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}
