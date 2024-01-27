import { Socket } from "socket.io";

export interface ServerPayloads {
	queue: {
		gameSettings: Settings;
	};

	lobbyState: {
		lobbyId: string;
		hasStarted: boolean;
		hasFinished: boolean;
		isSuspended: boolean;
		scores: Record<string, number>;
	};

	gameNotif: {
		message: string;
		color?: "green" | "red" | "blue" | "orange";
	};

	ballPosition: {
		x: number;
		y: number;
	};

	paddlePosition: {
		P1: number;
		P2: number;
	};

	pointScored: {
		scoreP1: number;
		scoreP2: number;
	};

	gameOver: {
		winner: string;
	};

	launch: {
		lobbyId: string;
	};

	playerNames: {
		P1Name: string;
		P2Name: string;
	}
}

export interface Board {
	width: number;
	height: number;
}

export interface Ball {
	x: number;
	y: number;
	directionX: number;
	directionY: number;
	speed: number;
	radius: number;
}

export interface Paddle {
	height: number;
	width: number;
}

export interface PlayerPaddle {
	x: number;
	y: number;
}

export interface InstancePlayer {
	client: Socket;
	score: number;
}

export interface GameResult {
	winner: InstancePlayer;
	loser: InstancePlayer;
}

export class Settings {
	ballSpeed: number;
	paddleSize: number;
}
