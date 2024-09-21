import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsNumberString, Length } from "class-validator";

export class CreateCommentStoryDto {
	@ApiProperty({ example: "This is a comment" })
	@Length(5)
	text: string;

	@ApiProperty()
	@IsNumberString()
	storyId: number;
}
