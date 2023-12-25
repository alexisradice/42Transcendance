import {
	IsOptional,
	IsString,
	Length,
	Matches,
	ValidateIf,
} from "class-validator";

export class UserSettingsDto {
	@IsString()
	@IsOptional()
	@ValidateIf((o) => o.displayName && o.displayName.length > 0)
	@Length(3, 20)
	@Matches(/^\w*$/, {
		message:
			"displayName can only contain alphanumeric characters and underscores",
	})
	displayName: string;

	// @IsString()
	// @IsNotEmpty()
	// image: string;
}
