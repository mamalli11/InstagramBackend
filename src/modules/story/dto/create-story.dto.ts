import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { StoryStatus, StoryType } from "../enums/story.enum";
import { IsEnum, IsOptional, IsString, Length } from "class-validator";

export class CreateStoryDto {
	@ApiProperty({ enum: StoryType })
	@IsEnum(StoryType)
	type: StoryType;

	@ApiProperty({ enum: StoryStatus })
	@IsEnum(StoryStatus)
	storyStatus: StoryStatus;

	@ApiProperty({ format: "binary" })
	mediaUrl: string;

	@ApiProperty({ enum: ["image", "video"], default: "image" })
	@IsEnum(["image", "video"])
	mediaType: string;

	@ApiPropertyOptional({ description: "max Length 300" })
	@IsOptional()
	@Length(0, 300)
	@IsString()
	caption: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	location: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	tags: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	mention: string;
}
