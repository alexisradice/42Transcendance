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

	async fromOauthToJwtTokens(oauthToken: string) {
		//revalidate access from 42API
		const userInfo = await this.validate(oauthToken);
		const payload = {
			sub: userInfo.login,
			email: userInfo.email,
			image: userInfo.image,
		};

		//creat (or find) user in database
		await this.userService.findOrCreate(userInfo);

		//generate two jwt tokens for access and refresh
		const [jwtToken, jwtRefreshToken] = await Promise.all([
			this.jwtService.signAsync(payload, {
				secret: this.configService.get<string>("JWT_SECRET"),
				expiresIn: "15m",
			}),
			this.jwtService.signAsync(payload, {
				secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
				expiresIn: "7d",
			}),
		]);
		return {
			jwtToken,
			jwtRefreshToken,
		};
	}

	// async updateRefreshToken(userId: string, refreshToken: string) {
	// 	const hashedRefreshToken = await this.hashData(refreshToken);
	// 	await this.usersService.update(userId, {
	// 	  refreshToken: hashedRefreshToken,
	// 	});
	//   }
}
