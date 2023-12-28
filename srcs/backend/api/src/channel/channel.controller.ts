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
		];
	}
}
