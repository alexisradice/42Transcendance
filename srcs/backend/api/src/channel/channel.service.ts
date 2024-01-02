import { Injectable } from "@nestjs/common";
import { Channel, ChannelVisibility, User } from "@prisma/client";
import { channel } from "diagnostics_channel";
import { PrismaService } from "src/prisma/prisma.service";
import * as argon2 from "argon2";

@Injectable()
export class ChannelService {
	constructor(private prisma: PrismaService) {}

	async getChannelList(login: string) {
		return await this.prisma.channel.findMany({
			where: {
				OR: [
					{ visibility: ChannelVisibility.PUBLIC },
					{ members: { some: { login: login } } },
				],
			},
		});
	}

	async findById(id: string) {
		const channel = await this.prisma.channel.findFirst({
			where: { id },
		});
		return channel;
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

	async isUserInChannel(user: User, channelId: string) {
		const chan = await this.prisma.channel.findUnique({
			where: {
				id: channelId,
				members: { some: { id: user.id } },
			},
		});
		return chan ? true : false;
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
}

// const exists = !!await prisma.place.findFirst(
// 	{
// 	  where: {
// 		name: "abc"
// 	  }
// 	}
//   );
