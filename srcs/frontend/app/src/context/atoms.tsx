import { atom } from "jotai";
import { SettingsType } from "../types";

export const gameSettingsAtom = atom<SettingsType>({
	ballSpeed: 2,
	paddleSize: 50,
});
