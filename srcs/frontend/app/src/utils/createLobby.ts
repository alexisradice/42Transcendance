// utils/createLobby.ts
import { LobbyType, PlayerType, SettingsType } from '../types.ts';
import { Socket } from 'socket.io-client';

const createLobby = (socket: Socket): LobbyType => {
    return {
        id: "lobby1",
        settings: {
            ballSpeed: 5,
            paddleSize: "medium",
            visibility: "public",
            inviteFriend: "yes",
            pause: false,
            mode: "classic"
        },
		player1: {
            name: "Player1",
            socket: socket,
            score: 0,
        },
        player2: {
            name: "Player2",
            socket: socket,
            score: 0,
        },
        score: 0,
        gameStarted: false
    };
};

export default createLobby;
