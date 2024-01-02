import { LobbyType, PlayerType, SettingsType } from '../types.ts';
import { Socket } from 'socket.io-client';

const sendSettings = (): SettingsType => {
    return {
        ballSpeed: 5,
        paddleSize: "medium",
        visibility: "public",
        inviteFriend: "yes",
        pause: false,
        mode: "classic"
    };
};

export default sendSettings;
