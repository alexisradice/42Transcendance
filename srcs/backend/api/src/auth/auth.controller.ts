import {
	Body,
	Controller,
	Patch,
	Post,
	Req,
	Res,
	UseGuards,
} from "@nestjs/common";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { JwtGuard } from "./jwtToken.guard";
// import { AuthGuard } from "./auth.guard";

@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post("login")
	async auth(
		@Body("code") code: string,
		@Res({ passthrough: true }) res: Response,
	) {
		const token = await this.authService.get42Token(code);
		const { jwtToken, jwtRefreshToken } =
			await this.authService.fromOauthToJwtTokens(token);
		res.cookie("jwtToken", jwtToken, { httpOnly: true });
		res.cookie("jwtRefreshToken", jwtRefreshToken, { httpOnly: true });
		res.cookie("isLogged", true);
		return { success: true };
	}

	@UseGuards(JwtGuard)
	@Patch("logout")
	async logout(@Req() req: Request) {
		const token = req.cookies.jwtToken;
		return await this.authService.logout(token);
	}
}
