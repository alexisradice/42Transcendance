import {
	Body,
	Controller,
	Get,
	HttpCode,
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

	@HttpCode(HttpStatus.OK)
	@Post()
	async auth(@Req() request: Request) {
		const token = request.headers["authorization"].split(" ")[1];
		// async auth(@Body() token: string) {
		console.log("token42: ", token);
		return await this.authService.fromOauthToJwtTokens(token);
	}

	@UseGuards(JwtGuard)
	@Patch("logout")
	async logout(@Req() req: Request) {
		// req.user = {...req.user, toto: "coucou"};
		const token = req.headers["authorization"].split(" ")[1];
		return await this.authService.logout(token);
	}
}
