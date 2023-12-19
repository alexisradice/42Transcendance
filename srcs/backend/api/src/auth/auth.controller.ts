import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
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

	@HttpCode(HttpStatus.OK)
	@Post()
	async auth(@Req() request: Request) {
		const token = request.headers["authorization"].split(" ")[1];
		// async auth(@Body() token: string) {
		return await this.authService.fromOauthToJwtTokens(token);
	}

	@UseGuards(JwtGuard)
	@Get("logout")
	async logout(@Req() req: Request) {
		const token = req.headers["authorization"].split(" ")[1];
		return await this.authService.logout(token);
	}
}
