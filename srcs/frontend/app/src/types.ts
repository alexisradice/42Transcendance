import { Socket } from 'socket.io-client';

export type Channel = {
	id: number;
	name: string;
	visibility: string;
};

export type Message = {
	id: string;
	createdAt: string;
	content: string;
	author: Partial<User>;
};

export type User = {
	login: string;
	displayName: string;
	image: string;
	twoFA: boolean;
};

export type Friend = {
	login: string;
	displayName: string;
	image: string;
	status: string;
};

export type ProfileSettings = {
	displayName: string;
	image: string | Blob | null;
};

export type SocketResponse = {
	success: boolean;
	error: unknown;
	payload?: unknown;
};

export type LobbyType = {
    id: string;
    settings: SettingsType;
    player1: PlayerType;
    player2: PlayerType;
    score: number;
    gameStarted: boolean;
};

export type PlayerType = {
    name: string;
    socket: Socket;
	score: number; 
};

export type SettingsType = {
    ballSpeed: number;
    paddleSize: string;
    visibility: string;
    inviteFriend: string;
    pause: boolean;
    mode: string;
};
