import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Put,
	Req,
	Res,
	UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { UserSettingsDto } from "src/dto";
import { JwtGuard } from "src/auth/jwtToken.guard";
import { Request, Response } from "express";
import { JwtService } from "@nestjs/jwt";
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
		const user = await this.userService.findOne({ login: req.user["sub"] });
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
	async updateUser(@Body() userDto: UserSettingsDto) {
		await this.userService.updateDisplayName(userDto);
		// await this.userService.updateAvatar(userDto.image);
		// await this.userService.switchTfa(userDto.tfa);
	}
}
