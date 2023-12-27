import React, { useState, useEffect } from 'react';
import { Button } from '@mantine/core';
import io from 'socket.io-client';

const PongGame = () => {
    const [gameState, setGameState] = useState({
        ball: { x: 300, y: 200, speedX: 2, speedY: 2, radius: 10 },
        leftPaddle: { y: 150, height: 100 },
        rightPaddle: { y: 150, height: 100 },
        score: { left: 0, right: 0 },
        gameStarted: false,
    });
    const [playersCount, setPlayersCount] = useState(0);
    useEffect(() => {
        const socket = io('http://localhost:3000'); // Replace with your backend URL
        socket.on('connect', () => {
            console.log('Connected to the server');
        });
        socket.on('error', (error) => {
            console.error('Socket.IO connection error:', error);
        });
        socket.on('disconnect', () => {
            console.log('Disconnected from the server');
        });
        socket.on('gameStateUpdate', (updatedGameState) => {
            setGameState(updatedGameState);
        });
        socket.on('playerJoined', () => {
            setPlayersCount((prevCount) => prevCount + 1);
        });

        socket.on('playerLeft', () => {
            setPlayersCount((prevCount) => Math.max(prevCount - 1, 0));
        });

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);
    const handleStartGame = () => {
        if (playersCount === 2) {
            socket.emit('startGame');
            setGameState({ ...gameState, gameStarted: true });
        } else {
            console.log('Waiting for another player to join...');
        }
    };
    const handleKeyPress = (e) => {
        // Handle paddle movements based on key presses
        // ...
    };
    return (
        <div tabIndex="0" onKeyDown={handleKeyPress}>
            {!gameState.gameStarted && (
                <Button onClick={handleStartGame} variant="filled">Start Game</Button>
            )}
        </div>
    );
};
export default PongGame;