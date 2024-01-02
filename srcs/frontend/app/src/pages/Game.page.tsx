// GamePage.tsx
import React, { useEffect } from 'react';
import io from 'socket.io-client';
import { useMyData } from "../hooks/useMyData";
import createLobby from '../utils/createLobby';
import sendSettings from '../utils/sendSettings';

export const GamePage = () => {
    const { user } = useMyData();

    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_URL);

        socket.emit("hello", "world");
        socket.emit("login", user.login);

        //const lobby = createLobby(socket);
        const settings = sendSettings();
        socket.emit("queue", settings, user.login);

        socket.on('response', (message) => {
            console.log(message); 
        });

        return () => {
            socket.disconnect();
        };
    }, [user.login]); 

    return <div>Game Page</div>;
};

export default GamePage;
