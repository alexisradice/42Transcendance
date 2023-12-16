import { IsNotEmpty, IsString } from "class-validator";

export class UserSettingsDto {
	@IsString()
	@IsNotEmpty()
	login: string;

	@IsString()
	@IsNotEmpty()
	displayName: string;

	// @IsString()
	// @IsNotEmpty()
	// image: string;
}
