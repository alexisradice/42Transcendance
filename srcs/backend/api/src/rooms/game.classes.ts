import { Socket } from 'socket.io';

export class Lobby {
	id: string;
	settings: Settings;
	player1: Player;
	player2: Player;
	gameStarted: boolean;
}

export class Player {
	name: string;
	socket: Socket;
	score: number;
	settings: Settings;
}

export class Settings {
	ballSpeed: number;
	paddleSize: string;
	visibility: string;
	inviteFriend: string;
	pause: boolean;
	mode: string;
}