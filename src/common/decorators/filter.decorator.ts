import { ApiQuery } from "@nestjs/swagger";
import { applyDecorators } from "@nestjs/common";

export function FilterBlog() {
	return applyDecorators(
		// ApiQuery({ name: "category", required: false }),
		ApiQuery({ name: "search", required: false }),
	);
}
