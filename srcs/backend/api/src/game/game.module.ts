import { Module } from "@nestjs/common";
import { GameGateway } from "./game.gateway";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/user/user.service";
import { LobbyManager } from "./lobby/lobby.manager";
import { GameService } from "./game.service";
import { InstanceFactory } from "./instance/instance.factory";
import { ChatService } from "src/chat/chat.service";
import { ChannelService } from "src/channel/channel.service";

@Module({
	providers: [
		GameGateway,
		JwtService,
		UserService,
		LobbyManager,
		GameService,
		InstanceFactory,
		ChannelService,
		ChatService,
	],
})
export class GameModule {}
