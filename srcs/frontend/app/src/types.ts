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

export type ChannelInfos = {
	channel: ChannelStripped;
	owner: ChannelMember;
	admins: ChannelMember[];
	members: ChannelMember[];
	messages: Message[];
	muted: string[];
};

export type ChannelStripped = {
	id: string;
	name: string;
	visibility: Visibility;
};

export type Channel = {
	id: string;
	name: string;
	visibility: Visibility;
	members: Partial<User>[];
	owner: Partial<User>;
	admins: Partial<User>[];
};

export type ChannelMember = Friend & {
	id: string;
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
	visibility: Visibility;
	inviteFriend: string;
	pause: boolean;
	mode: string;
};

export interface SocketResponse<T> {
	error?: unknown;
	data?: T;
}

export type DMChannel = {
	id: string;
	name: string;
	messages: {
		id: string;
		createdAt: string;
		content: string;
		author: {
			id: string;
			login: string;
			displayName: string;
			image: string;
		};
	};
	members: {
		id: string;
		login: string;
		displayName: string;
		image: string;
	};
	visibility: Visibility;
};
