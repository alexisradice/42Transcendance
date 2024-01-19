import { Module } from "@nestjs/common";
import { LobbiesService } from "./lobbies.service";
import { LobbiesGateway } from "./lobbies.gateway";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import { Game } from "./game.classes";
import { ChannelService } from "src/channel/channel.service";
import { ChatService } from "src/chat/chat.service";

@Module({
	providers: [
		LobbiesService,
		JwtService,
		LobbiesGateway,
		UserService,
		Game,
		ChannelService,
		ChatService,
	],
})
export class LobbiesModule {}
