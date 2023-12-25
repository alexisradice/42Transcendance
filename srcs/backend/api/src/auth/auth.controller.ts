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
		res.cookie("jwtToken", jwtToken, {
			maxAge: 15 * 60 * 1000, // 15 minutes
			httpOnly: true,
		});
		res.cookie("jwtRefreshToken", jwtRefreshToken, {
			maxAge: 7 * 24 * 3600 * 1000, // 7 days
			httpOnly: true,
		});
		res.cookie("isLogged", true, { maxAge: 7 * 24 * 3600 * 1000 });
		return { success: true };
	}

	@UseGuards(JwtGuard)
	@Patch("logout")
	async logout(@Req() req: Request, @Res() res: Response) {
		await this.authService.logout(req.user["login"]);
		res.clearCookie("jwtToken");
		res.clearCookie("jwtRefreshToken");
		res.clearCookie("isLogged");
		return res.json({ success: true });
	}
}
