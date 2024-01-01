import { Injectable } from "@nestjs/common";
import { ChannelVisibility } from "@prisma/client";
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
}
