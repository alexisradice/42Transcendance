import { Module } from "@nestjs/common";
import { LobbiesService } from "./lobbies.service";
import { LobbiesGateway } from "./lobbies.gateway";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import { Game } from "./game.classes";

@Module({
	providers: [LobbiesService, JwtService, LobbiesGateway, UserService, Game],
})
export class LobbiesModule {}
