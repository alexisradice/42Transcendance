import React, { useEffect, useState } from 'react';
import { useSocket } from "../../hooks/useSocket";
import styles from './PongGame.module.css';

const PongGame = ({ socket, lobbyId, user }) => {
    const [gameState, setGameState] = useState(null);
    const [gameBoardSize, setGameBoardSize] = useState({ width: 800, height: 600 });
    const [playerScores, setPlayerScores] = useState({ player1: 0, player2: 0 });
    const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });
    const [isMovingUp, setIsMovingUp] = useState(false);
    const [isMovingDown, setIsMovingDown] = useState(false);
    const [paddles, setPaddles] = useState({ paddle1Y: 50, paddle2Y: 50 });
    const [countdown, setCountdown] = useState(3);

    const scalePosition = (x, y) => {
        const scaledX = (x / 300) * 100; // Scale based on game board width
        const scaledY = (y / 100) * 100; // Scale based on game board height
        return { x: scaledX, y: scaledY };
    };

    const updateGameBoardSize = () => {
		const width = window.innerWidth * 0.8; // 80% of window width
		const height = width * 9 / 16; // 16:9 aspect ratio
		setGameBoardSize({ width, height });
	};

    useEffect(() => {
        updateGameBoardSize();
        window.addEventListener('resize', updateGameBoardSize);

        return () => {
            window.removeEventListener('resize', updateGameBoardSize);
        };
    }, []);

    useEffect(() => {


        const handleKeyDown = (event) => {
            if (event.key === 'ArrowUp') {
                setIsMovingUp(true);
            } else if (event.key === 'ArrowDown') {
                setIsMovingDown(true);
            }
        };
        
        const handleKeyUp = (event) => {
            if (event.key === 'ArrowUp') {
                setIsMovingUp(false);
            } else if (event.key === 'ArrowDown') {
                setIsMovingDown(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useEffect(() => {
        const movePaddle = () => {
            if (isMovingUp || isMovingDown) {
                let newY = paddles.paddle1Y;
                const moveAmount = 2; // Adjust speed as necessary
        
                if (isMovingUp) newY = Math.max(0, newY - moveAmount);
                if (isMovingDown) newY = Math.min(100, newY + moveAmount);
        
                //setPaddles(prevPaddles => ({ ...prevPaddles, paddle1Y: newY }));
                socket.emit(isMovingUp ? 'paddleUp' : 'paddleDown', { });
            }
        };

        const intervalId = setInterval(movePaddle, 16); // 60 FPS

        return () => {
            clearInterval(intervalId);
        };
    }, [isMovingUp, isMovingDown, paddles.paddle1Y, socket, lobbyId, user.login]);

    useEffect(() => {

		socket.on('paddleUpFront', (player1, player2) => {
            console.log('paddleUpFront', player1, player2);
	
			setPaddles(prevPaddles => ({ ...prevPaddles, paddle1Y: player1 }));
			setPaddles(prevPaddles => ({ ...prevPaddles, paddle2Y: player2 }));
        });

        socket.on('paddleDownFront', ( player1, player2) => {
			console.log('paddleDownFront',player1, player2);
			setPaddles(prevPaddles => ({ ...prevPaddles, paddle1Y: player1 }));
            setPaddles(prevPaddles => ({ ...prevPaddles, paddle2Y: player2 }));
        });
		
        socket.on('ballPosition', (data) => {
            const scaledPos = scalePosition(data.x, data.y);
            setBallPosition(scaledPos);
        });

        socket.on('gameUpdate', (data) => {
            setGameState(data.state);
            setPlayerScores(data.scores);
            setBallPosition(data.ballPosition);
            setPaddles(data.paddles);
        });

        return () => {
            socket.off('ballPosition');
            socket.off('gameUpdate');
			socket.off('paddleUpFront');
            socket.off('paddleDownFront');
        };
    }, [socket, lobbyId]);

    return (
        <div className={styles.game} style={{ width: gameBoardSize.width, height: gameBoardSize.height }}>
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
