import { Socket } from 'socket.io-client';

export type Channel = {
	id: number;
	name: string;
};

export type Message = {
	id: number;
	content: string;
	sender: string;
	createdAt: Date;
	updatedAt: Date | null;
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
