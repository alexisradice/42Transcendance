import { Controller, Post, Req } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
	constructor(
		private authService: AuthService,
		private userService: UserService,
	) {}

	@Post()
	async auth(@Req() request: Request) {
		const token = request.headers["authorization"].split(" ")[1];
		return await this.authService.fromOauthToJwt(token);
	}
}
