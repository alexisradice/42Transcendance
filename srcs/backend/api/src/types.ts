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
	error?: any;
	data?: any;
};

export const ACCESS_TOKEN_FLAG = true;
export const BOTH_TOKEN_FLAG = false;

export const BALL_SPEEDS = {
	1: "Very slow",
	2: "Slow",
	3: "Normal",
	4: "Fast",
	5: "Very fast",
};

export const PADDLE_SIZE = {
	10: "Very small",
	15: "Small",
	20: "Medium",
	25: "Large",
	30: "Very large",
};
