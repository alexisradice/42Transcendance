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
		// async auth(@Body() token: { token: string }) {
		return await this.authService.fromOauthToJwtTokens(token);
	}

	// @UseGuards(JwtGuard)
	// @Get('logout')
	// logout(@Req() req: Request) {
	// 	this.authService.logout(req.user['sub']);
	// }
}
