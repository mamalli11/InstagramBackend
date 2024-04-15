import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { PostEntity } from "./post.entity";

@Entity(EntityName.PostBookmark)
export class PostBookmarkEntity extends BaseEntity {
	@Column()
	postId: number;
	@Column()
	userId: number;
	@ManyToOne(() => UserEntity, (user) => user.post_bookmarks, { onDelete: "CASCADE" })
	user: UserEntity;
	@ManyToOne(() => PostEntity, (post) => post.bookmarks, { onDelete: "CASCADE" })
	post: PostEntity;
}
