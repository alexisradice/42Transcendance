import React, { useEffect } from 'react';
import io from 'socket.io-client';


export const GamePage = () => {
    // useEffect(() => {
    //     const socket = io('http://localhost:3000');
    //     socket.emit("hello", "world");

    //     socket.on('response', (message) => {
    //         console.log(message); 
    //     });

    //     return () => socket.disconnect();
    // }, []);

    return <div>Game Page</div>;
};

export default GamePage;
