import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpException,
	HttpStatus,
	Patch,
	Post,
	Req,
	UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { UserService } from "src/user/user.service";
import { AuthService } from "./auth.service";
import { JwtGuard } from "./jwtToken.guard";
// import { AuthGuard } from "./auth.guard";

@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post("42")
	async accessToken(@Body("code") code: string) {
		return await this.authService.get42Token(code);
	}

	@Post("login")
	async auth(@Req() request: Request) {
		const token = request.headers["authorization"].split(" ")[1];
		// async auth(@Body() token: string) {
		return await this.authService.fromOauthToJwtTokens(token);
	}

	@UseGuards(JwtGuard)
	@Patch("logout")
	async logout(@Req() req: Request) {
		const token = req.headers["authorization"].split(" ")[1];
		return await this.authService.logout(token);
	}
}
