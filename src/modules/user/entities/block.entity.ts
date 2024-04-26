import { BaseEntity } from "src/common/abstracts/base.entity";
import { Column, CreateDateColumn, Entity, ManyToOne } from "typeorm";

import { UserEntity } from "./user.entity";
import { EntityName } from "src/common/enums/entity.enum";

@Entity(EntityName.Block)
export class BlockEntity extends BaseEntity {
	@Column()
	userId: number;

	@Column()
	blockedId: number;

	@ManyToOne(() => UserEntity, (user) => user.blocklist, { onDelete: "CASCADE" })
	user: UserEntity;

	@ManyToOne(() => UserEntity, (user) => user.id, { onDelete: "CASCADE" })
	blocked: UserEntity;

	@CreateDateColumn()
	created_at: Date;
}
