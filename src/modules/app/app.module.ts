import { join } from "path";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserModule } from "../user/user.module";
import { AuthModule } from "../auth/auth.module";
import { PostModule } from "../post/post.module";
import { StoryModule } from "../story/story.module";
import { TypeOrmConfig } from "src/config/typeorm.config";
import { HashtagModule } from "../hashtag/hashtag.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: join(process.cwd(), ".env"),
		}),
		TypeOrmModule.forRoot(TypeOrmConfig()),
		AuthModule,
		UserModule,
		PostModule,
		StoryModule,
		HashtagModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
