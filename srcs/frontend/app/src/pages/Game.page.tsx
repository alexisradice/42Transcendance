// GamePage.tsx
import React, { useEffect, useRef, useState } from 'react';
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
    const [isPending, setIsPending] = useState(true);
	const gameSocket = useSocket("game");
	const [lobbyId, setLobbyId] = useState(null); // State to store lobbyId

    useEffect(() => {
        const settings = sendSettings();
        gameSocket.emit("queue", settings, user.login);
		console.log("queue sent");
		gameSocket.on('launch', (playerName, receivedLobbyId, settings) => {
			setLobbyId(receivedLobbyId);
			console.log('Launch event received:', playerName, receivedLobbyId, settings);
			gameSocket.emit('launchGame', true);
			setIsPending(false);
		});
	
		return () => {
			gameSocket.off('launch');
			gameSocket.disconnect();
		};
	}, [gameSocket]);

	return (
        <div>
            {isPending && <PendingPopup />}
			{!isPending && <PongGame lobbyId={lobbyId} user={user} />}

        </div>
    );
};

export default GamePage;