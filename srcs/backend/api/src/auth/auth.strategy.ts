import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-oauth2";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy, "oauth") {
	constructor(configService: ConfigService) {
		const clientID = configService.get<string>("OAUTH_CLIENT_ID");
		const clientSecret = configService.get<string>("OAUTH_CLIENT_SECRET");
		const domain = configService.get<string>("OAUTH_DOMAIN");
		super({
			authorizationURL: `${domain}oauth/authorize`,
			tokenURL: `${domain}oauth/token`,
			clientID,
			clientSecret,
			callbackURL: "http://localhost:3000/auth/callback",
			scope: "public",
		});
	}

	async validate(accessToken, refreshToken, profile, done) {
		const url = "https://api.intra.42.fr/v2/me";
		const response = await fetch(url, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
		const userProfile = await response.json();
		return done(null, {
			email: userProfile.email,
			login: userProfile.login,
			image: userProfile.image.link,
		});
	}
}
