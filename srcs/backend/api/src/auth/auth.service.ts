import { HttpException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { MiniUser } from "src/types";
import { UserService } from "src/user/user.service";

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService,
		private configService: ConfigService,
	) {}

	async validate(accessToken): Promise<MiniUser> {
		const url = "https://api.intra.42.fr/v2/me";
		let status;
		try {
			const response = await fetch(url, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
			status = response.status;
			if (!response.ok) {
				throw new TypeError(response.statusText);
			}
			const userProfile = await response.json();
			return {
				email: userProfile.email,
				login: userProfile.login,
				image: userProfile.image.link,
			};
		} catch (error) {
			throw new HttpException(error.message, status || 500);
		}
	}

	async fromOauthToJwt(oauthToken: string) {
		const userInfo = await this.validate(oauthToken);
		const payload = {
			sub: userInfo.login,
			email: userInfo.email,
			image: userInfo.image,
		};
		await this.userService.findOrCreate(userInfo);
		const options = {
			secret: this.configService.get<string>("JWT_SECRET"),
		};
		return {
			jwtToken: await this.jwtService.signAsync(payload, options),
		};
	}
}
