// GamePage.tsx
import React, { useEffect, useRef, useState } from 'react';
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
    const gameSocket = useSocket("game");
    const canvasRef = useRef(null);
    const [lobby, setLobby] = useState<LobbyType | null>(null);
    const [isPending, setIsPending] = useState(true);

    useEffect(() => {
        const settings = sendSettings();
        gameSocket.emit("queue", settings, user.login);

        gameSocket.on('launch', (receivedLobby: LobbyType) => {
            console.log('Lobby data received:', receivedLobby);
            setLobby(receivedLobby);
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
            <canvas ref={canvasRef} width="800" height="600" />
        </div>
    );
};

export default GamePage;