// GamePage.tsx
import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import PongGame from '../components/Game/PongGame';
import { useMyData } from "../hooks/useMyData";
import { useSocket } from "../hooks/useSocket";
import { LobbyType } from '../types';
import sendSettings from '../utils/sendSettings';

const PendingPopup = () => {
    return (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <p>Waiting for another player...</p>
        </div>
    );
};

export const GamePage = () => {
	const { user } = useMyData();
    const canvasRef = useRef(null);
    const [lobby, setLobby] = useState<LobbyType | null>(null);
    const [isPending, setIsPending] = useState(true);
	const gameSocket = useSocket("game");
	const Socket = io(import.meta.env.VITE_API_URL);

    useEffect(() => {
        const settings = sendSettings();
        gameSocket.emit("queue", settings, user.login);
		console.log("queue sent");
		gameSocket.on('launch', (playerName, lobbyId, settings) => {
			console.log('Launch event received:', playerName, lobbyId, settings);
			gameSocket.emit('launchGame', true);
			setIsPending(false);
		});
	
		return () => {
			gameSocket.off('launch');
			gameSocket.disconnect();
		};
	}, [Socket]);

	return (
        <div>
            {isPending && <PendingPopup />}
			{!isPending && <PongGame />}
        </div>
    );
};

export default GamePage;