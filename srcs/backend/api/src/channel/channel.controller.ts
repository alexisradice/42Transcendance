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
import { ChannelVisibility, Mute } from "@prisma/client";
import { Request } from "express";
import { JwtGuard } from "src/auth/jwtToken.guard";
import { ChannelService } from "./channel.service";
import * as argon2 from "argon2";
import { PasswordDto } from "src/dto";

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
		@Body() passwordDto: PasswordDto,
	) {
		const password = passwordDto.password;
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
		const userId = req.user["id"];
		const isUserInChannel = await this.channelService.isChannelMember(
			userId,
			channelId,
		);
		if (!isUserInChannel) {
			throw new ForbiddenException();
		}
		const channel =
			await this.channelService.findChannelByIdStripped(channelId);
		if (channel.visibility === ChannelVisibility.DM) {
			return channel;
		}
		const admins = channel.admins.filter(
			(admin) => admin.id !== channel.owner.id,
		);
		const members = channel.members.filter((member) => {
			const isAdmin = admins.find((admin) => admin.id === member.id);
			return member.id !== channel.owner.id && !isAdmin;
		});
		const mutedRaw = await this.channelService.getChannelMuted(channelId);
		const muted = await Promise.all(
			mutedRaw.map(async (mutedEntry) => {
				const isStillMuted = await this.channelService.isMuted(
					mutedEntry.user.id,
					channelId,
				);
				return isStillMuted ? mutedEntry.user.login : null;
			}),
		).then((results) => results.filter((mutedEntry) => mutedEntry));
		return { ...channel, admins, members, muted };
	}

	@Post("admin/promote")
	@UseGuards(JwtGuard)
	async promoteAdmin(
		@Req() req: Request,
		@Body("channelId") channelId: string,
		@Body("promoteeId") promoteeId: string,
	) {
		const channel = await this.channelService.findChannelById(channelId);
		const isAllowed = await this.channelService.isChannelOwner(
			req.user["id"],
			channel,
		);
		const isAdminable = await this.channelService.isChannelMember(
			promoteeId,
			channelId,
		);
		if (isAllowed && isAdminable) {
			await this.channelService.promoteAdmin(promoteeId, channelId);
		}
		return { success: true };
	}

	// trying to mute a user already muted won't do anything,
	// his mute time will not be increased
	@Post("admin/mute")
	@UseGuards(JwtGuard)
	async muteUser(
		@Req() req: Request,
		@Body("channelId") channelId: string,
		@Body("mutedId") mutedId: string,
	) {
		const adminId = req.user["id"];
		const channel = await this.channelService.findChannelById(channelId);
		const isAllowed = await this.channelService.hasRights(
			adminId,
			mutedId,
			channel,
			"mute",
		);
		if (isAllowed) {
			await this.channelService.muteUser(mutedId, channelId);
		}
		return { success: true };
	}

	@Post("admin/unmute")
	@UseGuards(JwtGuard)
	async unmuteUser(
		@Req() req: Request,
		@Body("channelId") channelId: string,
		@Body("mutedId") mutedId: string,
	) {
		const adminId = req.user["id"];
		const channel = await this.channelService.findChannelById(channelId);
		const isAllowed = await this.channelService.hasRights(
			adminId,
			mutedId,
			channel,
			"unmute",
		);
		if (isAllowed) {
			await this.channelService.unmuteUser(mutedId, channelId);
		}
		return { success: true };
	}

	@Post("password/add")
	@UseGuards(JwtGuard)
	async addPassword(
		@Req() req: Request,
		@Body("channelId") channelId: string,
		@Body("newPassword") passwordDto: PasswordDto,
	) {
		const password = passwordDto.password;
		const channel = await this.channelService.findChannelById(channelId);
		const isOwner = await this.channelService.isChannelOwner(
			req.user["id"],
			channel,
		);
		if (isOwner) {
			await this.channelService.addPassword(channelId, password);
		}
		return { success: true };
	}

	@Post("password/remove")
	@UseGuards(JwtGuard)
	async removePassword(
		@Req() req: Request,
		@Body("channelId") channelId: string,
	) {
		const channel = await this.channelService.findChannelById(channelId);
		const isOwner = await this.channelService.isChannelOwner(
			req.user["id"],
			channel,
		);
		if (isOwner) {
			await this.channelService.removePassword(channelId);
		}
		return { success: true };
	}

	@Post("password/change")
	@UseGuards(JwtGuard)
	async changePassword(
		@Req() req: Request,
		@Body("channelId") channelId: string,
		@Body("newPassword") passwordDto: PasswordDto,
	) {
		const newPassword = passwordDto.password;
		const channel = await this.channelService.findChannelById(channelId);
		const isOwner = await this.channelService.isChannelOwner(
			req.user["id"],
			channel,
		);
		if (isOwner) {
			await this.channelService.changePassword(channelId, newPassword);
		}
		return { success: true };
	}
}
