import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Req,
	UseGuards,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { JwtGuard } from "src/auth/jwtToken.guard";
import { UserSettingsDto } from "src/dto";
import { UserService } from "./user.service";
// import { AuthGuard } from "src/auth/auth.guard";

@Controller("user")
export class UserController {
	constructor(
		private userService: UserService,
		private jwtService: JwtService,
	) {}

	@Get("me")
	@UseGuards(JwtGuard)
	async getMe(@Req() req: Request) {
		const user = await this.userService.findOne({
			login: req.user["login"],
		});
		return {
			login: user.login,
			displayName: user.displayName,
			image: user.image,
		};
	}

	@Get(":login")
	@UseGuards(JwtGuard)
	async getUser(@Param("login") login: string) {
		return await this.userService.findOne({ login });
	}

	@Patch("update")
	@UseGuards(JwtGuard)
	async updateUser(@Req() req: Request, @Body() userDto: UserSettingsDto) {
		return await this.userService.updateUser(req.user["login"], userDto);
		// await this.userService.updateAvatar(userDto.image);
		// await this.userService.switchTfa(userDto.tfa);
	}
}
