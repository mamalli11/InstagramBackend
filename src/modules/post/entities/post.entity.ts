import { Column, Entity, ManyToOne, OneToMany, OneToOne } from "typeorm";

import { MediaEntity } from "./media.entity";
import { AlbumEntity } from "./album.entity";
import { EntityName } from "src/common/enums/entity.enum";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";

@Entity(EntityName.Post)
export class PostEntity extends BaseEntity {
    @Column()
    caption: string;
  
    @Column({
      type: "enum",
      enum: ["image", "video", "album"],
    })
    type: string;
  
    @Column()
    created_at: Date;
  
    @Column()
    updated_at: Date;
  
    @ManyToOne(() => UserEntity, user => user.posts)
    user: UserEntity;
  
    // @OneToMany(() => Comment, comment => comment.post)
    // comments: Comment[];
  
    // @OneToMany(() => Like, like => like.post)
    // likes: Like[];
  
    @OneToMany(() => MediaEntity, media => media.post)
    media: MediaEntity[];
  
    @OneToOne(() => AlbumEntity, album => album.post)
    album: AlbumEntity;
}
