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
