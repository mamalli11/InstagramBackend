import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { StoryStatus, StoryType } from "../enums/story.enum";
import { IsBooleanString, IsEnum, IsOptional, IsString, Length } from "class-validator";

export class CreateStoryDto {
	@ApiProperty({ enum: StoryType })
	@IsEnum(StoryType)
	mediaType: StoryType;

	@ApiProperty({ enum: StoryStatus })
	@IsEnum(StoryStatus)
	storyStatus: StoryStatus;

	@ApiProperty({ format: "binary" })
	media: string;

	@ApiPropertyOptional({ description: "max Length 300" })
	@IsOptional()
	@Length(0, 300)
	@IsString()
	caption: string;

	@ApiPropertyOptional({ type: "string", isArray: true })
	@IsOptional()
	location: string[];

	@ApiPropertyOptional({ type: "string", isArray: true })
	@IsOptional()
	tags: string[];

	@ApiPropertyOptional({ type: "string", isArray: true })
	@IsOptional()
	mention: string[];

	@ApiProperty({ default: true })
	@IsBooleanString()
	isComment: boolean;
}
