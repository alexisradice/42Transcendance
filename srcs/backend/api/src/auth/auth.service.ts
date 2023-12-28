import {
	ForbiddenException,
	HttpException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import * as argon2 from "argon2";
import { authenticator } from "otplib";
import { toDataURL, toFileStream } from "qrcode";
import { Response } from "express";
import { PrismaService } from "src/prisma/prisma.service";
import {
	ACCESS_TOKEN_FLAG,
	BOTH_TOKEN_FLAG,
	MiniUser,
	Payload,
	Tokens,
} from "src/types";
import { UserService } from "src/user/user.service";

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService,
		private configService: ConfigService,
		private prisma: PrismaService,
	) {}

	// send code to 42API to get the access token
	async get42Token(code: string): Promise<string> {
		const url = "https://api.intra.42.fr/oauth/token";
		let status: number;
		const body = {
			grant_type: "authorization_code",
			client_id: this.configService.get<string>("CLIENT_ID"),
			client_secret: this.configService.get<string>("CLIENT_SECRET"),
			redirect_uri: this.configService.get<string>("REDIRECT_URI"),
			code,
		};
		try {
			const response = await fetch(url, {
				method: "POST",
				body: new URLSearchParams(body),
			});
			status = response.status;
			if (!response.ok) {
				throw new TypeError(response.statusText);
			}
			const data = await response.json();
			return data.access_token;
		} catch (error) {
			throw new HttpException(error.message, status || 500);
		}
	}

	// handshake with 42API to validate token and get user info
	async validateUser(accessToken: string): Promise<MiniUser> {
		const url = "https://api.intra.42.fr/v2/me";
		let status: number;
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

	// returns jwtTokens with user information
	async getJwtTokens(user: User): Promise<Tokens> {
		const payload: Payload = { sub: user.login };
		const tokens = await this.generateTokens(payload, BOTH_TOKEN_FLAG);
		await this.updateRefreshToken(user.login, tokens.jwtRefreshToken);
		return tokens;
	}

	// generates a new jwt access token (always) and a new refresh token (if needed)
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

	// updates the refresh token in db with a hashed version
	async updateRefreshToken(login: string, refreshToken: string) {
		const hashedRefreshToken = await argon2.hash(refreshToken);
		await this.prisma.user.update({
			where: { login },
			data: { refreshToken: hashedRefreshToken },
		});
	}

	// uses refresh Token to replace expired jwt access token
	async refreshTokens(refreshToken: string) {
		try {
			const payload = await this.jwtService.verifyAsync(refreshToken, {
				secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
			});
			const user = await this.userService.findOne({ login: payload.sub });
			if (!user || !user.refreshToken)
				throw new UnauthorizedException("Access Denied");
			const refreshTokenMatches = await argon2.verify(
				user.refreshToken,
				refreshToken,
			);
			if (!refreshTokenMatches) {
				throw new ForbiddenException("Access Denied");
			}
			const tokens: Tokens = await this.generateTokens(
				{ sub: user.login },
				ACCESS_TOKEN_FLAG,
			);
			tokens.jwtRefreshToken = refreshToken;
			return tokens;
		} catch (error) {
			throw new HttpException(error.message, error.status || 500);
		}
	}

	// 2FA related functions
	async generateTwoFASecret(user: User) {
		const secret = authenticator.generateSecret();
		const otpAuthUrl = authenticator.keyuri(
			user.login,
			this.configService.get("TWO_FACTOR_AUTHENTICATION_APP_NAME"),
			secret,
		);
		await this.prisma.user.update({
			where: { login: user.login },
			data: { twoFASecret: secret },
		});
		return { secret, otpAuthUrl };
	}

	// returns URL with base64 QR code
	async generateQrCodeDataURL(otpAuthUrl: string) {
		return toDataURL(otpAuthUrl);
	}

	// verify the authentication code with the user's secret
	async verifyTwoFACode(code: string, user: User) {
		return authenticator.verify({
			token: code,
			secret: user.twoFASecret,
		});
	}

	// end of session -> destroys refreshToken in db
	async logout(login: string) {
		await this.prisma.user.update({
			where: { login },
			data: { refreshToken: null },
		});
	}
}
