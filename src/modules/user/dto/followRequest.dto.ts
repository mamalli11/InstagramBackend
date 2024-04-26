import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsNumberString } from "class-validator";

import { RequestType } from "../enums/profile.enum";

export class FollowRequestDto {
	@ApiProperty()
	@IsNumberString()
	userId: number;

	@ApiProperty({ enum: RequestType })
	@IsEnum(RequestType)
	RequestStatus: RequestType;
}
