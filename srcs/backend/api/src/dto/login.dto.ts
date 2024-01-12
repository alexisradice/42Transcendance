import {
	IsOptional,
	IsString,
	Length,
	Matches,
	ValidateIf,
} from "class-validator";

export class LoginDto {
	@IsString()
	@IsOptional()
	@ValidateIf((o) => o.login && o.login.length > 0)
	@Length(1, 10)
	@Matches(/^(\w|-)*$/, {
		message:
			"login can only contain alphanumeric characters, hyphens and underscores",
	})
	login: string;
}
