import { atom } from "jotai";
import { SettingsType } from "../types";

export const gameSettingsAtom = atom<SettingsType>({
	ballSpeed: 3,
	paddleSize: 20,
});

export const rainbowModeAtom = atom<boolean>(false);

export const firstTimeLogin = atom<boolean>(false);
