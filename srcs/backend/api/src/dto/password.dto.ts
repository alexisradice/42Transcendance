import {
	IsOptional,
	IsString,
	Length,
	Matches,
	ValidateIf,
} from "class-validator";

export class PasswordDto {
	@IsString()
	@IsOptional()
	@ValidateIf((o) => o.password && o.password.length > 0)
	@Length(8)
	password: string;
}
