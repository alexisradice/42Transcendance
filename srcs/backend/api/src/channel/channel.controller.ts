import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { JwtGuard } from "src/auth/jwtToken.guard";
import { Request } from "express";
import { ChannelService } from "./channel.service";

@Controller("channel")
export class ChannelController {
	constructor(private channelService: ChannelService) {}

	@Get("list")
	@UseGuards(JwtGuard)
	async getChannelList(@Req() req: Request) {
		const login = req.user["login"];
		this.channelService.getChannelList(login);
		return [];
	}

	@Post("create")
	@UseGuards(JwtGuard)
	async createChannel(
		@Req() req: Request,
		@Body("channelName") channelName: string,
	) {
		const login = req.user["login"];
		// this.channelService.createChannel(login, channelName);
	}

	@Get("messages")
	@UseGuards(JwtGuard)
	async getChannelMessages() {
		return [];
	}
}
