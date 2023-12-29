import { Injectable } from '@nestjs/common';

import { Socket } from 'socket.io';
import { UserService } from '../user/user.service';
import { Player, Lobby } from './game.classes';


@Injectable()
export class RoomsService {
	constructor(
		//private userService: UserService,
		) {}
		
	lobbies: Array<Lobby> = [];

	testFunction(socket: Socket): void {
		socket.emit('response', "hello");
	}

	lobbyCreateOrFind(code: string) {

		for (const llobby of this.lobbies) {
			console.log('Lobby ID:', llobby.id);
			console.log('Settings:', llobby.settings);
			console.log('Player 1:', llobby.player1);
			console.log('Player 2:', llobby.player2);
			console.log('Game Started:', llobby.gameStarted);
			console.log('---------------------');
		}

		const lobbyExists = this.lobbies.some(lobby => lobby.id === code);
		let lobby;

		if (lobbyExists) {
		  console.log(`Lobby with ID ${code} exists`);
		  lobby = this.lobbies.find(lobby => lobby.id === code);

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

	lobbyJoin(player: Player, socket: Socket, lobby: Lobby): void {

		if (lobby.player1 == null) {
			console.log("player1 is null");
			lobby.player1 = player;
			console.log("player1 is now", lobby.player1);
		}
		else if (lobby.player2 == null) {
			console.log("player2 is null");
			lobby.player2 = player;
			console.log("player2 is now", lobby.player1);
		}
		else {
			console.log("lobby is full");
			console.log("player1 is ", lobby.player1);
			console.log("player2 is ", lobby.player1);

			socket.emit('launch', lobby.id, lobby.settings, lobby.player1, lobby.player2, lobby.gameStarted);
		}
	}
}
