import { Module } from "@nestjs/common";
import { GameGateway } from "./game.gateway";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/user/user.service";
import { LobbyManager } from "./lobby/lobby.manager";
import { GameService } from "./game.service";
import { InstanceFactory } from "./instance/instance.factory";

@Module({
	providers: [
		GameGateway,
		JwtService,
		UserService,
		LobbyManager,
		GameService,
		InstanceFactory,
	],
})
export class GameModule {}
