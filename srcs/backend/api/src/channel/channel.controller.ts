import {
	Body,
	Controller,
	Get,
	HttpException,
	Post,
	Req,
	UseGuards,
} from "@nestjs/common";
import { JwtGuard } from "src/auth/jwtToken.guard";
import { Request } from "express";
import { ChannelService } from "./channel.service";
import { ChannelVisibility } from "@prisma/client";

@Controller("channel")
export class ChannelController {
	constructor(private channelService: ChannelService) {}

	@Get("list")
	@UseGuards(JwtGuard)
	async getChannelList(@Req() req: Request) {
		const login = req.user["login"];
		const channels = await this.channelService.getChannelList(login);
		return channels;
	}

	@Post("create")
	@UseGuards(JwtGuard)
	async createChannel(
		@Req() req: Request,
		@Body("channelName") channelName: string,
		@Body("visibility") visibility: ChannelVisibility,
		@Body("password") password?: string,
	) {
		if (visibility === ChannelVisibility.PROTECTED && !password) {
			throw new HttpException(
				"Password is required for protected channels",
				400,
			);
		}
		await this.channelService.createChannel(
			req.user["id"],
			channelName,
			visibility,
			password,
		);
		return { success: true };
	}

	@Get("messages")
	@UseGuards(JwtGuard)
	async getChannelMessages() {
		return [];
	}
}
