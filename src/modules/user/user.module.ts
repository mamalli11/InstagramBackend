import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserService } from "./user.service";
import { AuthModule } from "../auth/auth.module";
import { OtpEntity } from "./entities/otp.entity";
import { UserController } from "./user.controller";
import { UserEntity } from "./entities/user.entity";
import { BlockEntity } from "./entities/block.entity";
import { FollowEntity } from "./entities/follow.entity";
import { ProfileEntity } from "./entities/profile.entity";
import { FollowRequestEntity } from "./entities/follow-requst.entity";

@Module({
	imports: [
		AuthModule,
		TypeOrmModule.forFeature([
			OtpEntity,
			UserEntity,
			BlockEntity,
			FollowEntity,
			ProfileEntity,
			FollowRequestEntity,
		]),
	],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService],
})
export class UserModule {}
