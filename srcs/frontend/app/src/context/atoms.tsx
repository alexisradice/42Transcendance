import { atom } from "jotai";
import { SettingsType } from "../types";

export const gameSettingsAtom = atom<SettingsType>({
	ballSpeed: 3,
	paddleSize: 20,
});
