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
import { UserService } from "src/user/user.service";
// import { AuthGuard } from "./auth.guard";

@Controller("auth")
export class AuthController {
	constructor(
		private authService: AuthService,
		private userService: UserService,
	) {}

	@Post("login")
	async auth(
		@Body("code") code: string,
		@Res({ passthrough: true }) res: Response,
		@Req() req: Request,
	) {
		const token =
			req.cookies.token || (await this.authService.get42Token(code));
		const userInfo = await this.authService.validateUser(token);
		const user = await this.userService.findOrCreate(userInfo);
		if (user.twoFA) {
			const { otpAuthUrl } =
				await this.authService.generateTwoFASecret(user);
			res.cookie("token", token, {
				maxAge: 10 * 60 * 1000,
				httpOnly: true,
			});
			return this.authService.generateQrCodeDataURL(otpAuthUrl);
		}
		const tokens = await this.authService.getJwtTokens(user);
		res.cookie("jwtToken", tokens.jwtToken, {
			maxAge: 15 * 60 * 1000, // 15 minutes
			httpOnly: true,
		});
		res.cookie("jwtRefreshToken", tokens.jwtRefreshToken, {
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
