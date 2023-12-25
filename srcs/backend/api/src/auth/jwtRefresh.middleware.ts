import { HttpException, Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtRefreshMiddleware implements NestMiddleware {
	constructor(
		private authService: AuthService,
		private jwtService: JwtService,
		private configService: ConfigService,
	) {}

	async use(req: Request, res: Response, next: NextFunction) {
		const token = req.cookies.jwtToken;
		const refreshToken = req.cookies.jwtRefreshToken;
		if (!token && !refreshToken) {
			return next(new HttpException("No token provided", 401));
		}
		if (!token) {
			const { jwtToken } =
				await this.authService.refreshTokens(refreshToken);
			res.cookie("jwtToken", jwtToken, {
				maxAge: 15 * 60 * 1000, // 15 minutes
				httpOnly: true,
			});
			req.cookies.jwtToken = jwtToken;
		} else {
			try {
				await this.jwtService.verifyAsync(token, {
					secret: this.configService.get<string>("JWT_SECRET"),
				});
			} catch (err) {
				if (err.message === "jwt expired") {
					const { jwtToken } =
						await this.authService.refreshTokens(refreshToken);
					res.cookie("jwtToken", jwtToken, {
						maxAge: 15 * 60 * 1000, // 15 minutes
						httpOnly: true,
					});
					req.cookies.jwtToken = jwtToken;
				}
			}
		}
		next();
	}
}
