import { Injectable } from "@nestjs/common";
import { Channel, ChannelVisibility, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ChannelService {
	constructor(private prisma: PrismaService) {}

	async getChannelList(login: string) {
		return await this.prisma.channel.findMany({
			where: {
				OR: [
					{ visibility: ChannelVisibility.PUBLIC },
					{ users: { some: { login: login } } },
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
		return await this.prisma.channel.create({
			data: {
				name,
				owner: {
					connect: {
						id,
					},
				},
				users: {
					connect: {
						id,
					},
				},
				visibility,
				password,
			},
		});
	}

	async checkPermissions(
		user: User,
		channel: Channel,
		password: string | null,
	) {
		// owner = always can join
		if (channel.ownerId === user.id) {
			return true;
		}
		// TODO: find list of banned users for the channel

		// private channel = user can join only if he was already in
		if (channel.visibility === "PRIVATE") {
			if (!this.isUserInChannel(user, channel)) {
				return false;
			}
		}
		// protected channel = if user have the right password
		// if (channel.visibility === 'PROTECTED') {

		// }
		//
	}

	async isUserInChannel(user: User, channel: Channel) {
		const chan = await this.prisma.channel.findUnique({
			where: {
				id: channel.id,
				users: { some: { id: user.id } },
			},
		});
		return channel ? true : false;
	}
}

// const exists = !!await prisma.place.findFirst(
// 	{
// 	  where: {
// 		name: "abc"
// 	  }
// 	}
//   );
