export type MiniUser = {
	email: string;
	login: string;
	image: string;
};

export type UserSettings = {
	displayName?: string;
	image?: string;
};

export type FindOneCriteria = {
	email?: string;
	login?: string;
	id?: string;
};

export type Tokens = {
	jwtToken: string;
	jwtRefreshToken: string | null;
};

export type Payload = {
	sub: string;
	id: string;
};

export type SocketResponse = {
	success: boolean;
	error: any;
	payload?: any;
};

export const ACCESS_TOKEN_FLAG = true;
export const BOTH_TOKEN_FLAG = false;
