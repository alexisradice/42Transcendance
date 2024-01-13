import { Socket } from 'socket.io';

export class Lobby {
	id: string;
	settings: Settings;
	player1: Player;
	player2: Player;
	gameStarted: boolean;
	game: Game;
}

export class Player {
	name: string;
	socket: Socket;
	score: number;
	settings: Settings;
	lobby: Lobby;
}

export class Settings {
	ballSpeed: number;
	paddleSize: string;
	visibility: string;
	inviteFriend: string;
	pause: boolean;
	mode: string;
}

export class Game {
	map: { width: number; height: number };
	ball: { x: number; y: number; directionX: number; directionY: number, speed: number };
	paddlePlayer1: { x: number; y: number; height: number };
	paddlePlayer2: { x: number; y: number; height: number };
}