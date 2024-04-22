import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { HashtagService } from "./hashtag.service";
import { HashtagController } from "./hashtag.controller";
import { HashtagEntity } from "./entities/hashtag.entity";
import { AuthModule } from "../auth/auth.module";

@Module({
	imports: [AuthModule, TypeOrmModule.forFeature([HashtagEntity])],
	controllers: [HashtagController],
	providers: [HashtagService],
	exports: [HashtagService],
})
export class HashtagModule {}
