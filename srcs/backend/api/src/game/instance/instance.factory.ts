import { Injectable } from "@nestjs/common";
import { Instance } from "./instance";
import { Lobby } from "../lobby/lobby";
import { GameService } from "../game.service";

@Injectable()
export class InstanceFactory {
	constructor(private gameService: GameService) {}

	createInstance(lobby: Lobby) {
		return new Instance(lobby, this.gameService);
	}
}
