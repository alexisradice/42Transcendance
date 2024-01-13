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
	const [gameOverMessage, setGameOverMessage] = useState('');
	const [timeoutId, setTimeoutId] = useState(null);
	const { user } = useMyData();
    const [isPending, setIsPending] = useState(true);
	const gameSocket = useSocket("game");
	const [lobbyId, setLobbyId] = useState(null);

    useEffect(() => {
		gameSocket.on('connected', () => {
			const settings = sendSettings();
			gameSocket.emit("queue", settings);
			console.log("queue sent");
			gameSocket.on('launch', (playerName, receivedLobbyId, settings) => {
				setLobbyId(receivedLobbyId);
				//console.log('Launch event received:', playerName, receivedLobbyId, settings);
				gameSocket.emit('launchGame', true);
				setIsPending(false);
			});
		});
		gameSocket.on('gameOver', (winnerName) => {
			setGameOverMessage(`Game Over! Winner is ${winnerName}`);
			setIsPending(false);
			const id = setTimeout(() => {
				window.location.href = '/';
			}, 3000);
			setTimeoutId(id);
		});
	
		return () => {
			gameSocket.off('connected');
			gameSocket.off('launch');
			gameSocket.off('gameOver');
			gameSocket.disconnect();

			if (timeoutId) clearTimeout(timeoutId);
		};
	}, [gameSocket, timeoutId]);

	return (
		<div>
			{isPending && !gameOverMessage && <PendingPopup />}
			{gameOverMessage && (
				<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 100 }}>
					<p>{gameOverMessage}</p>
				</div>
			)}
			{!isPending && <PongGame socket={gameSocket} lobbyId={lobbyId} user={user} />}
		</div>
	);
};

export default GamePage;