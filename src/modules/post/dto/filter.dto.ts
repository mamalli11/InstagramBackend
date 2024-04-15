import { IsOptional, IsString } from "class-validator";

export class FilterPostDto {
	@IsOptional()
	@IsString()
	search: string;
}
