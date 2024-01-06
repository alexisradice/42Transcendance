import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/user/user.service";
import { ChannelService } from "src/channel/channel.service";
import { ChatService } from "./chat.service";

@Module({
	controllers: [],
	providers: [
		ChatGateway,
		JwtService,
		UserService,
		ChannelService,
		ChatService,
	],
})
export class ChatModule {}
