import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ExtractJwt, Strategy } from "passport-jwt";

export type JwtPayload = {
	sub: string;
	email: string;
	image: string;
};
@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy, "jwt") {
	constructor(private configService: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.get<string>("JWT_SECRET"),
		});
	}

	validate(payload: JwtPayload) {
		return payload;
	}
}
