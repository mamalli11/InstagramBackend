import { CreateDateColumn, Entity, ManyToOne } from "typeorm";

import { EntityName } from "src/common/enums/entity.enum";
import { UserEntity } from "../../user/entities/user.entity";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { PostEntity } from "src/modules/post/entities/post.entity";

@Entity(EntityName.PostLike)
export class PostLikeEntity extends BaseEntity {
	@ManyToOne(() => UserEntity, (user) => user.post_likes, { onDelete: "CASCADE" })
	user: UserEntity;

	@ManyToOne(() => PostEntity, (post) => post.likes, { onDelete: "CASCADE" })
	post: PostEntity;

	@CreateDateColumn()
	created_at: Date;
}
