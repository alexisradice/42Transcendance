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
};
