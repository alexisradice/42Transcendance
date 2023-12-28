import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtGuard } from "src/auth/jwtToken.guard";

@Controller("channel")
export class ChannelController {
	@Get("list")
	@UseGuards(JwtGuard)
	async getChannelList() {
		return [
			{
				id: 1,
				name: "general",
			},
			{
				id: 2,
				name: "random",
			},
			{
				id: 3,
				name: "nom-de-chan-tres-tres-tres-tres-long",
			},
			{
				id: 4,
				name: "channel4",
			},
			{
				id: 5,
				name: "channel5",
			},
			{
				id: 6,
				name: "channel6",
			},
			{
				id: 7,
				name: "channel7",
			},
			{
				id: 8,
				name: "channel8",
			},
			{
				id: 9,
				name: "channel9",
			},
			{
				id: 10,
				name: "channel10",
			},
			{
				id: 11,
				name: "channel11",
			},
			{
				id: 12,
				name: "channel12",
			},
		];
	}

	@Get("messages")
	@UseGuards(JwtGuard)
	async getChannelMessages() {
		return [
			{
				id: 1,
				content: "Hello, how are you?",
				sender: "Alice",
				createdAt: new Date(),
				updatedAt: null,
			},
			{
				id: 2,
				content: "I'm good, thanks! How about you?",
				sender: "Bob",
				createdAt: new Date(),
				updatedAt: null,
			},
			{
				id: 3,
				content: "I'm doing well, thanks for asking!",
				sender: "Alice",
				createdAt: new Date(),
				updatedAt: null,
			},
			{
				id: 4,
				content: "Great to hear. Have a good day!",
				sender: "Bob",
				createdAt: new Date(),
				updatedAt: null,
			},
		];
	}
}
