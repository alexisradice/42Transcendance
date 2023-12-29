import React, { useEffect } from 'react';
import io from 'socket.io-client';
import { useMyData } from "../hooks/useMyData";


export const GamePage = () => {
	const { user } = useMyData();

    useEffect(() => {
        const socket = io('http://localhost:3000');
        socket.emit("hello", "world");
        socket.emit("login", user.login);
        socket.emit("lobby", "123456789");

        socket.on('response', (message) => {
            console.log(message); 
        });

		return () => {
			socket.disconnect();
		  };
		}, []);

    return <div>Game Page</div>;
};

export default GamePage;
