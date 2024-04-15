import { BaseEntity } from "src/common/abstracts/base.entity";
import { Column, CreateDateColumn, Entity, ManyToOne } from "typeorm";
import { UserEntity } from "../../user/entities/user.entity";
import { PostEntity } from "src/modules/post/entities/post.entity";
import { EntityName } from "src/common/enums/entity.enum";

@Entity(EntityName.PostLike)
export class LikeEntity extends BaseEntity {
	@ManyToOne(() => UserEntity, (user) => user.likes, { onDelete: "CASCADE" })
	user: UserEntity;

	@ManyToOne(() => PostEntity, (post) => post.likes, { onDelete: "CASCADE" })
	post: PostEntity;

	@CreateDateColumn()
	created_at: Date;
}
