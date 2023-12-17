import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
	constructor(
		private authService: AuthService,
		private userService: UserService,
	) {}

	@Post()
	async auth(@Body() accessToken: { token: string }) {
		return await this.authService.fromOauthToJwt(accessToken.token);
	}
}
