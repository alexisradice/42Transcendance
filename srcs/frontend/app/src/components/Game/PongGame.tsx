import React, { useEffect, useRef } from 'react';

const PongGame = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas background
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Paddle dimensions and position
        const paddleWidth = 10;
        const paddleHeight = 100;
        const paddleX = (player) => player === 1 ? 0 : canvas.width - paddleWidth;
        const paddleY = (canvas.height - paddleHeight) / 2;

        // Draw left paddle
        ctx.fillStyle = 'white';
        ctx.fillRect(paddleX(1), paddleY, paddleWidth, paddleHeight);

        // Draw right paddle
        ctx.fillRect(paddleX(2), paddleY, paddleWidth, paddleHeight);

        // Ball dimensions and position
        const ballSize = 10;
        const ballX = (canvas.width - ballSize) / 2;
        const ballY = (canvas.height - ballSize) / 2;

        // Draw ball
        ctx.fillRect(ballX, ballY, ballSize, ballSize);

    }, []);

    return <canvas ref={canvasRef} width="800" height="600" />;
};

export default PongGame;
