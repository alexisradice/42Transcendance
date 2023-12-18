export type MiniUser = {
	email: string;
	login: string;
	image: string;
};

export type FindOneCriteria = {
	email?: string;
	login?: string;
};

export type Tokens = {
	jwtToken: string;
	jwtRefreshToken: string | null;
};

export type Payload = {
	sub: string;
	email: string;
	image: string;
};

export const ACCESS_TOKEN_FLAG = true;
export const BOTH_TOKEN_FLAG = false;
