import React, { useEffect, useState } from 'react';
import { useSocket } from "../../hooks/useSocket";
import styles from './PongGame.module.css';

const PongGame = ({ lobbyId, user }) => {
    const gameSocket = useSocket("game");
    const [gameState, setGameState] = useState(null); // Replace null with your initial game state structure
    const [playerScores, setPlayerScores] = useState({ player1: 0, player2: 0 });
    const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });
    const [paddles, setPaddles] = useState({ paddle1Y: 50, paddle2Y: 50 });
    const [countdown, setCountdown] = useState(3); // Initialize countdown

    useEffect(() => {
        // Set up WebSocket listeners for game state updates
        gameSocket.on('gameUpdate', (data) => {
            setGameState(data.state);
            setPlayerScores(data.scores);
            setBallPosition(data.ballPosition);
            setPaddles(data.paddles);
        });

        // Countdown logic before the game starts
        const countdownInterval = setInterval(() => {
            setCountdown((prevCountdown) => prevCountdown > 0 ? prevCountdown - 1 : 0);
        }, 1000);

        // Key event handlers for paddle movement
        const handleKeyDown = (event) => {
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                gameSocket.emit('paddleMove', { lobbyId, direction: event.key, user: user.login });
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            clearInterval(countdownInterval);
            window.removeEventListener('keydown', handleKeyDown);
            gameSocket.off('gameUpdate');
        };
    }, [gameSocket, lobbyId, user]);

    // Render the game UI
	return (
        <div className={styles.game}>
            {countdown > 0 && <div className={styles.countdown}>{countdown}</div>}
            <div className={styles.gameBoard}>
                <div className={styles.ball} style={{ left: `${ballPosition.x}%`, top: `${ballPosition.y}%` }} />
                <div className={styles.paddle} style={{ top: `${paddles.paddle1Y}%` }} />
                <div className={styles.paddle} style={{ top: `${paddles.paddle2Y}%` }} />
                <div className={styles.score}>{playerScores.player1}</div>
                <div className={styles.score}>{playerScores.player2}</div>
            </div>
        </div>
    );
};

export default PongGame;