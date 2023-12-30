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

export type User = {
	login: string;
	displayName: string;
	image: string;
	twoFA: boolean;
};

export type ProfileSettings = {
	displayName: string;
	image: string | Blob | null;
};
