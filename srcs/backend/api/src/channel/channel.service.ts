import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Channel, ChannelVisibility, Prisma, User } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import * as argon2 from "argon2";
import { PrismaService } from "src/prisma/prisma.service";

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
				members: {
					select: {
						login: true,
						image: true,
					},
				},
				owner: {
					select: {
						login: true,
					},
				},
				admins: {
					select: {
						login: true,
					},
				},
			},
		});
	}

	async findChannelById(id: string, select?: Prisma.ChannelSelect) {
		const channel = await this.prisma.channel.findFirst({
			where: { id },
			select,
		});
		return channel;
	}

	async findOrCreateDm(userId: string, destId: string) {
		const foundDm = await this.prisma.channel.findFirst({
			where: {
				AND: [
					{ members: { some: { id: userId } } },
					{ members: { some: { id: destId } } },
					{ isDM: true },
				],
			},
		});
		if (foundDm) {
			return foundDm;
		}
		const createdDm = await this.prisma.channel.create({
			data: {
				name: userId + destId,
				owner: {
					connect: {
						id: userId,
					},
				},
				members: {
					connect: [{ id: userId }, { id: destId }],
				},
				isDM: true,
				visibility: ChannelVisibility.DM,
			},
		});
		return createdDm;
	}

	async getChannelMessages(userId: string, channelId: string) {
		return await this.prisma.message.findMany({
			where: {
				channelId,
				NOT: [
					{ author: { blockedBy: { some: { id: userId } } } },
					{ author: { bannedFrom: { some: { id: channelId } } } },
				],
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
					},
				},
			},
			orderBy: { createdAt: "asc" },
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

	async destroyChannel(channelId: string) {
		return await this.prisma.channel.delete({
			where: {
				id: channelId,
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

	async removeUserFromChannel(user: User, channelId: string) {
		return await this.prisma.channel.update({
			where: { id: channelId },
			data: {
				members: {
					disconnect: {
						id: user.id,
					},
				},
				admins: {
					disconnect: {
						id: user.id,
					},
				},
			},
		});
	}

	// FUNCTIONS TO CHECK USER'S ROLE

	async isChannelMember(userId: string, channelId: string) {
		const chan = await this.prisma.channel.findFirst({
			where: {
				id: channelId,
				members: { some: { id: userId } },
			},
		});
		return chan ? true : false;
	}

	async isChannelAdmin(userId: string, channelId: string) {
		const chan = await this.prisma.channel.findFirst({
			where: {
				id: channelId,
				admins: { some: { id: userId } },
			},
		});
		return chan ? true : false;
	}

	async isChannelOwner(userId: string, channel: Channel) {
		if (userId === channel.ownerId) {
			return true;
		}
		return false;
	}

	async changeOwnership(channel: Channel) {
		let heir = await this.prisma.user.findFirst({
			where: {
				adminOf: { some: { id: channel.id } },
			},
			orderBy: {
				createdAt: "asc",
			},
		});
		if (!heir) {
			heir = await this.prisma.user.findFirst({
				where: {
					memberOf: { some: { id: channel.id } },
				},
				orderBy: {
					createdAt: "asc",
				},
			});
		}
		if (heir) {
			await this.prisma.channel.update({
				where: {
					id: channel.id,
				},
				data: {
					ownerId: heir.id,
				},
			});
			return false;
		}
		return true;
	}

	async promoteAdmin(userId: string, channelId: string) {
		return await this.prisma.channel.update({
			where: {
				id: channelId,
			},
			data: {
				admins: {
					connect: {
						id: userId,
					},
				},
			},
		});
	}

	// ADMIN FUNCTIONS

	// kicked user isn't a member anymore
	async kickUser(kicker: User, user: User, channelId: string) {
		const isAdmin = this.isChannelAdmin(kicker.id, channelId);
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
		const isAdmin = this.isChannelAdmin(admin.id, channelId);
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
		const isAdmin = this.isChannelAdmin(admin.id, channelId);
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
	// mute is 5 minutes for now
	async muteUser(admin: User, user: User, channelId: string) {
		const isAdmin = this.isChannelAdmin(admin.id, channelId);
		if (!isAdmin) {
			throw new UnauthorizedException(
				`You don't have permission to mute ${user.displayName}`,
			);
		}
		// await this.prisma.channel.update({
		// 	where: { id: channelId },
		// 	data: {
		// 		muted: {
		// 			connect: { id: user.id },
		// 		},
		// 	},
		// });
		return await this.prisma.mute.create({
			data: {
				expiresAt: new Date(Date.now() + 5 * 60000),
				user: {
					connect: {
						id: user.id,
					},
				},
				channel: {
					connect: {
						id: channelId,
					},
				},
			},
		});
	}

	async unmuteUser(admin: User, user: User, channelId: string) {
		const isAdmin = this.isChannelAdmin(admin.id, channelId);
		if (!isAdmin) {
			throw new UnauthorizedException(
				`You don't have permission to unmute ${user.displayName}`,
			);
		}
		// return await this.prisma.channel.update({
		// 	where: { id: channelId },
		// 	data: {
		// 		muted: {
		// 			disconnect: { id: user.id },
		// 		},
		// 	},
		// });
		return await this.prisma.mute.deleteMany({
			where: {
				AND: [{ channelId: channelId }, { userId: user.id }],
			},
		});
	}

	async IsMuted(userId: string, channelId: string) {
		const muted = await this.prisma.mute.findFirst({
			where: {
				AND: [{ channelId }, { userId }],
			},
		});
		if (!muted) {
			return false;
		}
		const expireDate = muted.expiresAt;
		const now = new Date(Date.now());
		if (now < expireDate) {
			return true;
		}
		await this.prisma.mute.deleteMany({
			where: {
				AND: [{ channelId }, { userId }],
			},
		});
		return false;
	}
}

// const exists = !!await prisma.place.findFirst(
// 	{
// 	  where: {
// 		name: "abc"
// 	  }
// 	}
//   );
