import {
	Body,
	Controller,
	ForbiddenException,
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
import { channel } from "diagnostics_channel";

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
		const createdChannel = await this.channelService.createChannel(
			req.user["id"],
			channelName,
			visibility,
			password,
		);
		return createdChannel;
	}

	@Get(":channelId")
	@UseGuards(JwtGuard)
	async getChannel(
		@Req() req: Request,
		@Param("channelId") channelId: string,
	) {
		const isUserInChannel = await this.channelService.isChannelMember(
			req.user["id"],
			channelId,
		);
		if (!isUserInChannel) {
			throw new ForbiddenException();
		}
		const channel =
			await this.channelService.findChannelByIdStripped(channelId);
		const owner = await this.channelService.getChannelOwner(channelId);
		const admins = await this.channelService.getChannelAdmins(channelId);
		const members = await this.channelService.getChannelMembers(channelId);
		return { channel, owner, admins, members };
	}

	@Post("admin/promote")
	@UseGuards(JwtGuard)
	async promoteAdmin(
		@Req() req: Request,
		@Body("channelId") channelId: string,
		@Body("adminableId") adminableId: string,
	) {
		try {
			const channel =
				await this.channelService.findChannelById(channelId);
			const isAllowed = await this.channelService.isChannelOwner(
				req.user["id"],
				channel,
			);
			const isAdminable = await this.channelService.isChannelMember(
				adminableId,
				channelId,
			);
			if (isAllowed && isAdminable) {
				await this.channelService.promoteAdmin(adminableId, channelId);
			}
			return { success: true };
		} catch (e) {
			return { success: false };
		}
	}
}
