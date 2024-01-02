import {
	Body,
	Controller,
	Get,
	HttpException,
	Param,
	Post,
	Req,
	UseGuards,
} from "@nestjs/common";
import { ChannelVisibility } from "@prisma/client";
import { Request } from "express";
import { JwtGuard } from "src/auth/jwtToken.guard";
import { ChannelService } from "./channel.service";

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

	@Get(":channelId/messages")
	@UseGuards(JwtGuard)
	async getChannelMessages(
		@Req() req: Request,
		@Param("channelId") channelId: string,
	) {
		const isUserInChannel = await this.channelService.isUserInChannel(
			req.user["id"],
			channelId,
		);
		if (!isUserInChannel) {
			throw new HttpException("User is not in channel", 403);
		}
		const messages =
			await this.channelService.getChannelMessages(channelId);
		return messages || [];
	}
}
