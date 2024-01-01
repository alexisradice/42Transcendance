import { Injectable } from "@nestjs/common";
import { ChannelVisibility } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ChannelService {
	constructor(private prisma: PrismaService) {}

	getChannelList(login: string) {
		return this.prisma.channel.findMany({
			where: {
				OR: [
					{ visibility: ChannelVisibility.PUBLIC },
					{ users: { some: { login: login } } },
				],
			},
		});
	}

	// createChannel(login: string, channelName: string) {
	// 	return this.prisma.channel.create({
	// 		data: {
	// 			name: channelName,
	// 			users: {
	// 				connect: {
	// 					login: login,
	// 				},
	// 			},
	// 		},
	// 	});
	// }
}
