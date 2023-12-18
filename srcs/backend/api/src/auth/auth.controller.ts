import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	UseGuards,
} from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { AuthService } from "./auth.service";
// import { AuthGuard } from "./auth.guard";

@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) {}

	@HttpCode(HttpStatus.OK)
	@Post()
	async auth(@Req() request: Request) {
		const token = request.headers["authorization"].split(" ")[1];
		// async auth(@Body() token: { token: string }) {
		return await this.authService.fromOauthToJwtTokens(token);
	}
}
