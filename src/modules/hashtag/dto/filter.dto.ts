import { IsOptional, IsString } from "class-validator";

export class FilterHashtagsDto {
	@IsOptional()
	@IsString()
	search: string;
}
