import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Payload } from "src/types";
import { Request } from "express";

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy, "jwt") {
	constructor(private configService: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				AuthStrategy.extractJWT,
			]),
			secretOrKey: configService.get<string>("JWT_SECRET"),
			ignoreExpiration: false,
		});
	}

	private static extractJWT(req: Request): string | null {
		if (
			req.cookies &&
			"jwtToken" in req.cookies &&
			req.cookies.jwtToken.length > 0
		) {
			return req.cookies.jwtToken;
		}
		return null;
	}

	async validate(payload: Payload) {
		return { login: payload.sub };
	}
}
