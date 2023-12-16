import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { OAuthGuard } from "./auth.guard";
import { UserService } from "src/user/user.service";
import { MiniUser } from "src/types";

@Controller("auth")
export class AuthController {
	constructor(private userService: UserService) {}

	@Get()
	@UseGuards(OAuthGuard)
	async auth() {}

	@Get("callback")
	@UseGuards(OAuthGuard)
	callback(@Req() req: Request) {
		return this.userService.findOrCreate(req.user as MiniUser);
	}
}
