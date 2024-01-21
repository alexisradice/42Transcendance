import { Socket } from "socket.io";

export type LobbyMode = "private" | "public";

export interface ServerPayloads {
	queue: {
		gameSettings: Settings;
	};

	lobbyState: {
		lobbyId: string;
		mode: LobbyMode;
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

	waitingForOpponent: {
		lobbyId: string;
	};

	launch: {
		lobbyId: string;
	};
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
}

export interface Paddle {
	x: number;
	y: number;
	height: number;
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
	paddleSize: string;
}
