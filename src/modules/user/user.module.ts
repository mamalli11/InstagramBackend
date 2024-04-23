import { Module } from "@nestjs/common";

import { UserService } from "./user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { OtpEntity } from "./entities/otp.entity";
import { UserController } from "./user.controller";
import { UserEntity } from "./entities/user.entity";
import { FollowEntity } from "./entities/follow.entity";
import { ProfileEntity } from "./entities/profile.entity";

@Module({
	imports: [
		AuthModule,
		TypeOrmModule.forFeature([UserEntity, ProfileEntity, OtpEntity, FollowEntity]),
	],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService],
})
export class UserModule {}
