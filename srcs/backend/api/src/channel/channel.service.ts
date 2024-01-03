import {
	HttpException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { Channel, ChannelVisibility, User } from "@prisma/client";
import { channel } from "diagnostics_channel";
import { PrismaService } from "src/prisma/prisma.service";
import * as argon2 from "argon2";

@Injectable()
export class ChannelService {
	constructor(private prisma: PrismaService) {}

	// get all channels accessible to the user:
	// default -> the ones he's already joined
	// + the Public and Protected ones
	async getChannelList(login: string) {
		return await this.prisma.channel.findMany({
			where: {
				OR: [
					{ visibility: ChannelVisibility.PUBLIC },
					{ visibility: ChannelVisibility.PROTECTED },
					{ members: { some: { login: login } } },
				],
				NOT: { banned: { some: { login: login } } },
			},
			select: {
				id: true,
				name: true,
				visibility: true,
			},
		});
	}

	async findChannelById(id: string) {
		const channel = await this.prisma.channel.findFirst({
			where: { id },
		});
		return channel;
	}

	async getChannelMessages(channelId: string) {
		return await this.prisma.message.findMany({
			where: {
				channelId,
			},
			select: {
				id: true,
				content: true,
				createdAt: true,
				author: {
					select: {
						login: true,
						displayName: true,
						image: true,
						blockedBy: true,
					},
				},
			},
		});
	}

	async createChannel(
		id: string,
		name: string,
		visibility: ChannelVisibility,
		password: string,
	) {
		const hashedPassword = await argon2.hash(password);
		return await this.prisma.channel.create({
			data: {
				name,
				owner: {
					connect: {
						id,
					},
				},
				admins: {
					connect: {
						id,
					},
				},
				members: {
					connect: {
						id,
					},
				},
				visibility,
				password: hashedPassword,
			},
		});
	}

	// user has been banned = cannot re-enter
	// private channel = nobody new can enter
	// wrong password (protected chan)
	async checkPermissions(user: User, channel: Channel, password?: string) {
		const isBannedFromChannel = await this.prisma.channel.findFirst({
			where: {
				id: channel.id,
				banned: { some: { id: user.id } },
			},
		});
		if (isBannedFromChannel || channel.visibility === "PRIVATE") {
			return false;
		}

		if (channel.visibility === "PROTECTED") {
			const passwordValid = await argon2.verify(
				channel.password,
				password,
			);
			if (!passwordValid) {
				return false;
			}
		}

		return true;
	}

	async addUserToChannel(user: User, channelId: string) {
		return await this.prisma.channel.update({
			where: { id: channelId },
			data: {
				members: {
					connect: {
						id: user.id,
					},
				},
			},
		});
	}

	// FUNCTIONS TO CHECK USER'S ROLE

	async isChannelMember(user: User, channelId: string) {
		const chan = await this.prisma.channel.findFirst({
			where: {
				id: channelId,
				members: { some: { id: user.id } },
			},
		});
		return chan ? true : false;
	}

	async isChannelAdmin(user: User, channelId: string) {
		const chan = await this.prisma.channel.findFirst({
			where: {
				id: channelId,
				admins: { some: { id: user.id } },
			},
		});
		return chan ? true : false;
	}

	async isChannelOwner(user: User, channel: Channel) {
		if (user.id === channel.ownerId) {
			return true;
		}
		return false;
	}

	// ADMIN FUNCTIONS

	// kicked user isn't a member anymore
	async kickUser(kicker: User, user: User, channelId: string) {
		const isAdmin = this.isChannelAdmin(kicker, channelId);
		if (!isAdmin) {
			throw new UnauthorizedException(
				`You don't have permission to kick ${user.displayName}`,
			);
		}
		return await this.prisma.channel.update({
			where: { id: channelId },
			data: {
				members: {
					disconnect: { id: user.id },
				},
			},
		});
	}

	// banned user isn't a member anymore and cannot join
	async banUser(admin: User, user: User, channelId: string) {
		const isAdmin = this.isChannelAdmin(admin, channelId);
		if (!isAdmin) {
			throw new UnauthorizedException(
				`You don't have permission to ban ${user.displayName}`,
			);
		}
		return await this.prisma.channel.update({
			where: { id: channelId },
			data: {
				banned: {
					connect: { id: user.id },
				},
				members: {
					disconnect: { id: user.id },
				},
			},
		});
	}

	// unbanned does not put user back in channel members,
	// he must re-join
	async unbanUser(admin: User, user: User, channelId: string) {
		const isAdmin = this.isChannelAdmin(admin, channelId);
		if (!isAdmin) {
			throw new UnauthorizedException(
				`You don't have permission to unban ${user.displayName}`,
			);
		}
		return await this.prisma.channel.update({
			where: { id: channelId },
			data: {
				banned: {
					disconnect: { id: user.id },
				},
			},
		});
	}

	// muted user is still a member : can join but read-only
	async muteUser(admin: User, user: User, channelId: string) {
		const isAdmin = this.isChannelAdmin(admin, channelId);
		if (!isAdmin) {
			throw new UnauthorizedException(
				`You don't have permission to mute ${user.displayName}`,
			);
		}
		return await this.prisma.channel.update({
			where: { id: channelId },
			data: {
				muted: {
					connect: { id: user.id },
				},
			},
		});
	}

	async unmuteUser(admin: User, user: User, channelId: string) {
		const isAdmin = this.isChannelAdmin(admin, channelId);
		if (!isAdmin) {
			throw new UnauthorizedException(
				`You don't have permission to unmute ${user.displayName}`,
			);
		}
		return await this.prisma.channel.update({
			where: { id: channelId },
			data: {
				muted: {
					disconnect: { id: user.id },
				},
			},
		});
	}
}

// const exists = !!await prisma.place.findFirst(
// 	{
// 	  where: {
// 		name: "abc"
// 	  }
// 	}
//   );
