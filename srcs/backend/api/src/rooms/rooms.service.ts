import { Injectable } from "@nestjs/common";

import { Socket } from "socket.io";
import { UserService } from "../user/user.service";
import { Player, Lobby, Settings } from "./game.classes";

import { User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import {
	FindOneCriteria as FindOneParam,
	MiniUser,
	UserSettings,
} from "src/types";


@Injectable()
export class RoomsService {
	constructor(
		//private userService: UserService,
		//private prisma: PrismaService,
	) {}

	lobbies: Array<Lobby> = [];
	queue: Array<Player> = [];

	testFunction(socket: Socket): void {
		socket.emit("response", "hello");
	}

	areSettingsEqual(settingsPlayer1: Settings, settingsPlayer2: Settings): boolean {
		return (
			settingsPlayer1.ballSpeed === settingsPlayer2.ballSpeed &&
			settingsPlayer1.paddleSize === settingsPlayer2.paddleSize &&
			settingsPlayer1.visibility === settingsPlayer2.visibility &&
			settingsPlayer1.inviteFriend === settingsPlayer2.inviteFriend &&
			settingsPlayer1.pause === settingsPlayer2.pause &&
			settingsPlayer1.mode === settingsPlayer2.mode
		);
	}

	addPlayerToQueue(player: Player): void {
		for (const player of this.queue) {
			console.log("Name:", player.name);
			console.log("Score:", player.score);
			console.log("Settings:", player.settings);
			console.log("---------------------");
		}

		const playerExists = this.queue.some((pplayer) => pplayer.name === player.name);
		let queue;

		if (playerExists) {
			console.log(`player with name ${player.name} exists`);
			queue = this.queue.find((queue) => queue.name === player.name);
		} 
		else {
			console.log(`player with name ${player.name} does not exist`);
			this.queue.push(player);
		}


		if (this.queue.length >= 2) {
			let matchingPlayer;
		
			for (let i = 0; i < this.queue.length; i++) {
				const currentPlayer = this.queue[i];
		
				if (currentPlayer.name !== player.name && this.areSettingsEqual(currentPlayer.settings, player.settings)) {
					matchingPlayer = currentPlayer;
					break;
				}
			}
		
			if (matchingPlayer) {
				const code = this.generateUUID();
				const lobby = this.lobbyCreateOrFind(code);
		
				this.lobbyJoin(player, lobby);
				this.lobbyJoin(matchingPlayer, lobby);
		
				this.queue = this.queue.filter((pplayer) => pplayer.name !== player.name && pplayer.name !== matchingPlayer!.name);
			}
		}
	}

	cleanClient(client) {
		for (let i = 0; i < this.queue.length; i++) {
			if (this.queue[i].socket === client)
				this.queue.splice(i, 1);
		}
	}

	generateUUID(): string {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
			const r = (Math.random() * 16) | 0;
			const v = c === "x" ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	}

	lobbyCreateOrFind(code: string) {
		for (const llobby of this.lobbies) {
			console.log("Lobby ID:", llobby.id);
			console.log("Settings:", llobby.settings);
			console.log("Player 1:", llobby.player1);
			console.log("Player 2:", llobby.player2);
			console.log("Game Started:", llobby.gameStarted);
			console.log("---------------------");
		}

		const lobbyExists = this.lobbies.some((lobby) => lobby.id === code);
		let lobby;

		if (lobbyExists) {
			console.log(`Lobby with ID ${code} exists`);
			lobby = this.lobbies.find((lobby) => lobby.id === code);
		} else {
			console.log(`Lobby with ID ${code} does not exist`);

			lobby = new Lobby();
			lobby.id = code;
			lobby.settings = null;
			lobby.player1 = null;
			lobby.player2 = null;
			lobby.gameStarted = false;

			this.lobbies.push(lobby);
		}
		return lobby;
	}

	lobbyJoin(player: Player, lobby: Lobby): void {
		if (lobby.player1 == null) {
			console.log("player1 is null");
			lobby.player1 = player;
			console.log("player1 is now", lobby.player1.name);
		} else if (lobby.player2 == null) {
			console.log("player2 is null");
			lobby.player2 = player;
			console.log("player2 is now", lobby.player2.name);
		}
		if (lobby.player1 != null && lobby.player2 != null) {
			console.log("lobby is full");
			console.log("player1 is ", lobby.player1.name);
			console.log("player2 is ", lobby.player2.name);
			lobby.settings = lobby.player1.settings;
			console.log("Lobby Info: ID", lobby.id, " Settings: ", lobby.settings, " Player1: ", lobby.player1, " Player2: ", lobby.player2," GameStarted: ", lobby.gameStarted,);

			lobby.player1.socket.emit("launch", lobby);
		}
	}
}
