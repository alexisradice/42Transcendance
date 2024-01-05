// GamePage.tsx
import React, { useEffect } from 'react';
import io from 'socket.io-client';
import { useMyData } from "../hooks/useMyData";
import { useSocket } from "../hooks/useSocket";
import createLobby from '../utils/createLobby';
import sendSettings from '../utils/sendSettings';

export const GamePage = () => {
    const { user } = useMyData();
	const  gameSocket = useSocket("game");

    useEffect(() => {
        

        gameSocket.emit("hello", "world");

        //const lobby = createLobby(socket);
        const settings = sendSettings();
        gameSocket.emit("queue", settings);

        gameSocket.on('response', (message) => {
            console.log(message); 
        });

        return () => {
			gameSocket.off('response');
            gameSocket.disconnect();
        };
    }, [gameSocket]); 

    return <div>Game Page</div>;
};

export default GamePage;