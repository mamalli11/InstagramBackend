import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, Length } from "class-validator";

import { PostStatus, PostType } from "../enums/post.enum";

export class CreatePostDto {
	@ApiProperty({ enum: PostType })
	@IsEnum(PostType)
	type: PostType;

	@ApiProperty({ default: PostStatus.Published, enum: PostStatus })
	@IsEnum(PostStatus)
	status: PostStatus;

	@ApiPropertyOptional({ default: true })
	isComment: boolean;

	@ApiProperty({ description: "max Length 1000" })
	@Length(1, 1000)
	@IsString()
	caption: string;

	@ApiProperty({ type: "string", isArray: true })
	mention: string[];

	@ApiProperty({ format: "binary" })
	media1: string;

	@ApiPropertyOptional({ nullable: true, format: "binary" })
	@IsOptional()
	media2: string;

	@ApiPropertyOptional({ nullable: true, format: "binary" })
	@IsOptional()
	media3: string;

	@ApiPropertyOptional({ nullable: true, format: "binary" })
	@IsOptional()
	media4: string;

	@ApiPropertyOptional({ nullable: true, format: "binary" })
	@IsOptional()
	media5: string;

	@ApiPropertyOptional({ nullable: true, format: "binary" })
	@IsOptional()
	media6: string;

	@ApiPropertyOptional({ nullable: true, format: "binary" })
	@IsOptional()
	media7: string;

	@ApiPropertyOptional({ nullable: true, format: "binary" })
	@IsOptional()
	media8: string;

	@ApiPropertyOptional({ nullable: true, format: "binary" })
	@IsOptional()
	media9: string;

	@ApiPropertyOptional({ nullable: true, format: "binary" })
	@IsOptional()
	media10: string;

	// @ApiProperty({ type: "string", format: "binary", isArray: true, maxItems: 10, minItems: 1 })
	// medias: string[];
}
