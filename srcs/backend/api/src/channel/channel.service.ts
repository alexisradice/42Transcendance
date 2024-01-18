import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Channel, ChannelVisibility, User } from "@prisma/client";
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
				NOT: [
					{
						banned: { some: { login: login } },
					},
				],
			},
			select: {
				id: true,
				name: true,
				visibility: true,
				members: {
					select: {
						displayName: true,
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
			orderBy: { createdAt: "asc" },
		});
	}

	async findChannelById(id: string) {
		const channel = await this.prisma.channel.findFirst({
			where: { id },
		});
		return channel;
	}

	async findOrCreateDm(userId: string, destId: string) {
		const foundDm = await this.prisma.channel.findFirst({
			where: {
				AND: [
					{ members: { some: { id: userId } } },
					{ members: { some: { id: destId } } },
					{ visibility: ChannelVisibility.DM },
				],
			},
			select: {
				id: true,
				name: true,
				messages: {
					select: {
						id: true,
						createdAt: true,
						content: true,
						author: {
							select: {
								id: true,
								login: true,
								displayName: true,
								image: true,
							},
						},
					},
				},
				members: {
					select: {
						id: true,
						login: true,
						displayName: true,
						image: true,
					},
				},
				visibility: true,
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
				visibility: ChannelVisibility.DM,
			},
			select: {
				id: true,
				name: true,
				messages: {
					select: {
						id: true,
						createdAt: true,
						content: true,
						author: {
							select: {
								id: true,
								login: true,
								displayName: true,
								image: true,
							},
						},
					},
				},
				members: {
					select: {
						id: true,
						login: true,
						displayName: true,
						image: true,
					},
				},
				visibility: true,
			},
		});
		if (createdDm) {
			await this.createNotif(userId, createdDm.id);
			await this.createNotif(destId, createdDm.id);
		}
		return createdDm;
	}

	async createNotif(userId: string, channelId: string) {
		return await this.prisma.notif.create({
			data: {
				channelId: channelId,
				lastChecked: new Date(Date.now()),
				newMsg: false,
				user: {
					connect: {
						id: userId,
					},
				},
			},
		});
	}

	async findChannelByIdStripped(id: string) {
		const channel = await this.prisma.channel.findFirst({
			where: { id },
			select: {
				id: true,
				name: true,
				visibility: true,
				owner: {
					select: {
						id: true,
						login: true,
						displayName: true,
						image: true,
						status: true,
					},
				},
				admins: {
					select: {
						login: true,
						id: true,
						displayName: true,
						image: true,
						status: true,
					},
				},
				members: {
					select: {
						login: true,
						id: true,
						displayName: true,
						image: true,
						status: true,
					},
				},
				messages: {
					select: {
						id: true,
						createdAt: true,
						content: true,
						author: {
							select: {
								id: true,
								login: true,
								displayName: true,
								image: true,
								status: true,
							},
						},
					},
				},
			},
		});
		return channel;
	}

	async getChannelMuted(channelId: string) {
		return await this.prisma.mute.findMany({
			where: {
				channelId,
			},
			select: {
				id: true,
				expiresAt: true,
				user: {
					select: {
						id: true,
						login: true,
						displayName: true,
						image: true,
					},
				},
			},
			orderBy: { expiresAt: "asc" },
		});
	}

	async createChannel(
		id: string,
		name: string,
		visibility: ChannelVisibility,
		password: string,
	) {
		const hashedPassword = await argon2.hash(password);
		const channel = await this.prisma.channel.create({
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
		if (channel) {
			return await this.prisma.notif.create({
				data: {
					channelId: channel.id,
					lastChecked: new Date(Date.now()),
					newMsg: false,
					user: {
						connect: {
							id,
						},
					},
				},
			});
		}
	}

	async destroyChannel(channelId: string) {
		await this.prisma.channel.delete({
			where: {
				id: channelId,
			},
		});
		return await this.prisma.notif.deleteMany({
			where: {
				channelId: channelId,
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
		await this.prisma.channel.update({
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
		await this.prisma.channel.update({
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
		return await this.prisma.notif.deleteMany({
			where: {
				AND: [{ channelId: channelId }, { userId: user.id }],
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
				NOT: { id: channel.ownerId },
			},
			orderBy: {
				createdAt: "asc",
			},
		});
		if (!heir) {
			heir = await this.prisma.user.findFirst({
				where: {
					memberOf: { some: { id: channel.id } },
					NOT: { id: channel.ownerId },
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
					owner: { connect: { id: heir.id } },
					admins: { connect: { id: heir.id } },
				},
			});
			return false;
		}
		return true;
	}

	// OWNER FUNCTIONS

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

	async removePassword(channelId: string) {
		return await this.prisma.channel.update({
			where: {
				id: channelId,
			},
			data: {
				visibility: ChannelVisibility.PUBLIC,
			},
		});
	}

	async changePassword(channelId: string, password: string) {
		const hashedPassword = await argon2.hash(password);
		return await this.prisma.channel.update({
			where: {
				id: channelId,
			},
			data: {
				password: hashedPassword,
			},
		});
	}

	async addPassword(channelId: string, password: string) {
		const hashedPassword = await argon2.hash(password);
		return await this.prisma.channel.update({
			where: {
				id: channelId,
			},
			data: {
				visibility: ChannelVisibility.PROTECTED,
				password: hashedPassword,
			},
		});
	}

	// ADMIN FUNCTIONS

	// kicked user isn't a member anymore
	async kickUser(kickedId: string, channelId: string) {
		await this.prisma.channel.update({
			where: { id: channelId },
			data: {
				members: {
					disconnect: { id: kickedId },
				},
				admins: {
					disconnect: { id: kickedId },
				},
			},
		});
		return await this.prisma.notif.deleteMany({
			where: {
				AND: [{ channelId: channelId }, { userId: kickedId }],
			},
		});
	}

	async hasRights(
		userId: string,
		targetId: string,
		channel: Channel,
		action: string,
	) {
		const isAdmin = await this.isChannelAdmin(userId, channel.id);
		if (!isAdmin) {
			throw new UnauthorizedException(
				`You don't have permission to ${action} this user`,
			);
		}
		const isTargetOwner = await this.isChannelOwner(targetId, channel);
		if (isTargetOwner) {
			throw new UnauthorizedException(
				`You don't have permission to ${action} this user`,
			);
		}
		const isOwner = await this.isChannelOwner(userId, channel);
		const isTargetAdmin = await this.isChannelAdmin(targetId, channel.id);
		if (isTargetAdmin && !isOwner) {
			throw new UnauthorizedException(
				`You don't have permission to ${action} this user`,
			);
		}
		return true;
	}

	// banned user isn't a member anymore and cannot join
	async banUser(userId: string, channelId: string) {
		await this.prisma.channel.update({
			where: { id: channelId },
			data: {
				banned: {
					connect: { id: userId },
				},
				members: {
					disconnect: { id: userId },
				},
				admins: {
					disconnect: { id: userId },
				},
			},
		});
		return await this.prisma.notif.deleteMany({
			where: {
				AND: [{ channelId: channelId }, { userId: userId }],
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
	async muteUser(targetId: string, channelId: string) {
		return await this.prisma.mute.create({
			data: {
				expiresAt: new Date(Date.now() + 5 * 60000),
				user: {
					connect: {
						id: targetId,
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

	async unmuteUser(targetId: string, channelId: string) {
		return await this.prisma.mute.deleteMany({
			where: {
				AND: [{ channelId: channelId }, { userId: targetId }],
			},
		});
	}

	async isMuted(userId: string, channelId: string) {
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

	async updateNotifDate(channelId: string, userId: string) {
		return await this.prisma.notif.updateMany({
			where: {
				AND: [{ channelId }, { userId }],
			},
			data: {
				lastChecked: new Date(Date.now()),
			},
		});
	}

	async updateNotifNewMessages(
		channelId: string,
		userId: string,
		newMessages: boolean,
	) {
		const notifs = await this.prisma.notif.updateMany({
			where: {
				channelId: channelId,
				userId: userId,
			},
			data: {
				newMsg: newMessages,
			},
		});
		return notifs;
	}

	async getNotif(userId: string) {
		return await this.prisma.notif.findMany({
			where: {
				userId,
			},
			select: {
				id: true,
				channelId: true,
				lastChecked: true,
				newMsg: true,
			},
		});
	}

	// async updateNotifications(userId: string) {
	// 	const notifRaw = await this.getNotif(userId);
	// 	const muted = await Promise.all(
	// 		notifRaw.map(async (notifEntry) => {
	// 			const checkDate = notifEntry.lastChecked;
	// 			const hasNewMessages = await this.prisma.message.findFirst({
	// 				where: {
	// 					AND:[
	// 						{channelId: notifEntry.channelId},
	// 						{createdAt: {gte: checkDate}},
	// 					],
	// 				},
	// 			});
	// 			if (hasNewMessages) {
	// 				await this.updateNotifNewMessages(notifEntry.channelId, userId, true);
	// 			}
	// 		}),
	// 	);
	// }
}
