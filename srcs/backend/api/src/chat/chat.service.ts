import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ChatService {
	constructor(private prisma: PrismaService) {}

	async createMessage(channelId: string, userId: string, content: string) {
		return await this.prisma.message.create({
			data: {
				content,
				channel: {
					connect: {
						id: channelId,
					},
				},
				author: {
					connect: {
						id: userId,
					},
				},
			},
		});
	}
}
