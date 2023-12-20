import { ForbiddenException, HttpException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";
import {
	ACCESS_TOKEN_FLAG,
	BOTH_TOKEN_FLAG,
	MiniUser,
	Payload,
	Tokens,
} from "src/types";
import { UserService } from "src/user/user.service";
import * as argon2 from "argon2";

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService,
		private configService: ConfigService,
		private prisma: PrismaService,
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

	async fromOauthToJwtTokens(oauthToken: string): Promise<Tokens> {
		// revalidate access from 42API
		const userInfo = await this.validate(oauthToken);
		const payload: Payload = { sub: userInfo.login };

		// creat (or find) user in database
		await this.userService.findOrCreate(userInfo);

		// generate two jwt tokens for access and refresh
		const tokens = await this.generateTokens(payload, BOTH_TOKEN_FLAG);

		// put hashed refreshToken in db
		await this.updateRefreshToken(userInfo.login, tokens.jwtRefreshToken);
		return tokens;
	}

	async generateTokens(payload: Payload, flag: boolean): Promise<Tokens> {
		const jwtToken = await this.jwtService.signAsync(payload, {
			secret: this.configService.get<string>("JWT_SECRET"),
			expiresIn: "15m",
		});
		if (flag === ACCESS_TOKEN_FLAG) {
			return { jwtToken, jwtRefreshToken: null };
		}
		const jwtRefreshToken = await this.jwtService.signAsync(payload, {
			secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
			expiresIn: "7d",
		});
		return { jwtToken, jwtRefreshToken };
	}

	// update the refresh token in db with a hashed version
	async updateRefreshToken(login: string, refreshToken: string) {
		const hashedRefreshToken = await argon2.hash(refreshToken);
		await this.prisma.user.update({
			where: { login },
			data: { refreshToken: hashedRefreshToken },
		});
	}

	async refreshTokens(login: string, refreshToken: string) {
		const user = await this.userService.findOne({ login });
		if (!user || !user.refreshToken)
			throw new ForbiddenException("Access Denied");
		const refreshTokenMatches = await argon2.verify(
			user.refreshToken,
			refreshToken,
		);
		if (!refreshTokenMatches) throw new ForbiddenException("Access Denied");
		const tokens: Tokens = await this.generateTokens(
			{ sub: user.login },
			ACCESS_TOKEN_FLAG,
		);
		tokens.jwtRefreshToken = refreshToken;
		return tokens;
	}

	async logout(token: string) {
		const decodedToken: Payload = this.jwtService.decode(token);
		await this.prisma.user.update({
			where: { login: decodedToken.sub },
			data: { refreshToken: null },
		});
	}
}
