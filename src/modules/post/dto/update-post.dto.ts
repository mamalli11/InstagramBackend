import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsString, Length } from "class-validator";

import { PostStatus } from "../enums/post.enum";

export class UpdatePostDto {
	@ApiProperty({ description: "max Length 300" })
	@Length(1, 300)
	@IsString()
	caption: string;

	@ApiProperty({ default: PostStatus.Published, enum: PostStatus })
	@IsEnum(PostStatus)
	status: PostStatus;

	@ApiPropertyOptional()
	isComment: boolean;

	@ApiProperty({ type: "string", isArray: true })
	mention: string[];
}
