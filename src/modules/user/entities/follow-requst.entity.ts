import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne } from "typeorm";

import { UserEntity } from "./user.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { BaseEntity } from "src/common/abstracts/base.entity";

@Entity(EntityName.FollowRequest)
export class FollowRequestEntity extends BaseEntity {
	@Column()
	userId: number;

	@Column()
	requseted: number;

	@Column({ type: "enum", enum: ["accepted", "waiting"], default: "waiting" })
	status: string;

	@ManyToOne(() => UserEntity, (user) => user.requestedFollow, { onDelete: "CASCADE" })
	user: UserEntity;

	@ManyToOne(() => UserEntity, (user) => user.id, { onDelete: "CASCADE" })
    @JoinColumn({ name: "requseted" })
	requset: UserEntity;

	@CreateDateColumn()
	created_at: Date;
}
