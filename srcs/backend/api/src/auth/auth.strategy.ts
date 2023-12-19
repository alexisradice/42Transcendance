import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Payload } from "src/types";

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy, "jwt") {
	constructor(private configService: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.get<string>("JWT_SECRET"),
		});
	}

	validate(payload: Payload) {
		return payload;
	}
}
