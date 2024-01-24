import { Status, Visibility } from "./types";

export const PUBLIC: Visibility = "PUBLIC";
export const PROTECTED: Visibility = "PROTECTED";
export const PRIVATE: Visibility = "PRIVATE";
export const DM: Visibility = "DM";

export const ONLINE: Status = "ONLINE";
export const OFFLINE: Status = "OFFLINE";
export const IN_QUEUE: Status = "IN_QUEUE";
export const IN_GAME: Status = "IN_GAME";

export const BALL_MARKS = [
	{ value: 1, label: "Very slow" },
	{ value: 2, label: "Slow" },
	{ value: 3, label: "Normal" },
	{ value: 4, label: "Fast" },
	{ value: 5, label: "Very fast" },
];

export const PADDLE_MARKS = [
	{ value: 10, label: "Very small" },
	{ value: 15, label: "Small" },
	{ value: 20, label: "Medium" },
	{ value: 25, label: "Large" },
	{ value: 30, label: "Very large" },
];
