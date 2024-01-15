import { Socket } from "socket.io-client";

const visibilityValues = {
	public: "PUBLIC",
	protected: "PROTECTED",
	private: "PRIVATE",
	dm: "DM",
} as const;

type Visibility = (typeof visibilityValues)[keyof typeof visibilityValues];

const memberRoleValues = {
	owner: "owner",
	admin: "admin",
	member: "member",
} as const;

export type MemberRole =
	(typeof memberRoleValues)[keyof typeof memberRoleValues];

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

export interface MyData {
	id: string;
	login: string;
	displayName: string;
	image: string;
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
	paddleSize: string;
	visibility: Visibility;
	inviteFriend: string;
	pause: boolean;
	mode: string;
}

export interface SocketResponse<T> {
	error?: unknown;
	data?: T;
}

export interface DMChannel {
	id: string;
	name: string;
	messages: Message[];
	members: GeneralUser[];
	visibility: Visibility;
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
