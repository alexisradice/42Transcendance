import { Socket } from 'socket.io';

export class Lobby {
    id: string;
    settings: Settings;
    player1: Player;
    player2: Player;
	score: number;
	gameStarted: boolean;
}

export class Player {
    name: string;
    socket: Socket;
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
    title: string;
    content: string;
    authorId: number;
}