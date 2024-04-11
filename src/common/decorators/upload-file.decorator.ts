import { MaxFileSizeValidator, ParseFilePipe, UploadedFile } from "@nestjs/common";

export function UploadedOptionalFile() {
	return UploadedFile(
		new ParseFilePipe({
			fileIsRequired: false,
			validators: [new MaxFileSizeValidator({ maxSize: 3000000 })],
		}),
	);
}
