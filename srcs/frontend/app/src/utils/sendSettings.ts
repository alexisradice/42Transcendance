import { LobbyType, PlayerType, SettingsType } from '../types.ts';
import { Socket } from 'socket.io-client';

const sendSettings = (settings: SettingsType): SettingsType => {
    return settings;
};

export default sendSettings;
