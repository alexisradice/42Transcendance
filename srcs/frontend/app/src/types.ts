import { Socket } from "socket.io-client";

const visibilityValues = {
	public: "PUBLIC",
	protected: "PROTECTED",
	private: "PRIVATE",
	dm: "DM",
} as const;

export type Visibility =
	(typeof visibilityValues)[keyof typeof visibilityValues];

const memberRoleValues = {
	owner: "owner",
	admin: "admin",
	member: "member",
} as const;

export type MemberRole =
	(typeof memberRoleValues)[keyof typeof memberRoleValues];

const statusValues = {
	online: "ONLINE",
	offline: "OFFLINE",
	inQueue: "IN_QUEUE",
	inGame: "IN_GAME",
} as const;

export type Status = (typeof statusValues)[keyof typeof statusValues];
export interface Message {
	id: string;
	createdAt: string;
	content: string;
	author: GeneralUser;
}

export interface GeneralUser {
	id: string;
	login: string;
	displayName: string;
	image: string;
	status: string;
}

export interface MyData extends GeneralUser {
	twoFA: boolean;
}

export interface BlockedUser {
	id: string;
	login: string;
}

export interface ProfileSettings {
	displayName: string;
	image: string | Blob | null;
}

export interface LobbyType {
	id: string;
	settings: SettingsType;
	player1: PlayerType;
	player2: PlayerType;
	score: number;
	gameStarted: boolean;
}

export interface PlayerType {
	name: string;
	socket: Socket;
	score: number;
}

export interface SettingsType {
	ballSpeed: number;
	paddleSize: number;
}

export interface SocketResponse<T> {
	error?: unknown;
	data?: T;
}

export interface DMChannel {
	id: string;
	name: string;
	visibility: Visibility;
	messages: Message[];
	members: GeneralUser[];
}

export interface ChannelInfos extends DMChannel {
	owner: GeneralUser;
	admins: GeneralUser[];
	muted: string[];
}

export type Channel = {
	id: string;
	name: string;
	visibility: Visibility;
	owner: GeneralUser;
	admins: GeneralUser[];
	members: GeneralUser[];
};

export type Notifs = Record<string, boolean>;

export interface SocketContextType {
	gameSocket: Socket;
	isPending: boolean;
	setIsPending: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface LobbyResponse {
	lobbyId: string;
}

export interface UserStats {
	id: string;
	gamesPlayed: number;
	wins: number;
	losses: number;
	winStreak: number;
}

export interface GameSession {
	id: string;
	createdAt: Date;
	winner: GeneralUser;
	loser: GeneralUser;
	winnerScore: number;
	loserScore: number;
	ballSpeed: number;
	paddleSize: string;
}

export interface GameStats {
	id: string;
	displayName: string;
	login: string;
	image: true;
	stats: UserStats;
	gamesPlayed: GameSession[];
}
