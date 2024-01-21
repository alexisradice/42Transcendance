import { FC, useEffect, useState } from "react";
import styles from "./PongGame.module.css";
import { useSocketContext } from "../../context/useContextGameSocket";
import { useSocket } from "../../hooks/useSocket";
import { IN_GAME } from "../../constants";

const PongGame: FC = () => {
	const chatSocket = useSocket("chat");
	const { gameSocket } = useSocketContext();
	// const [gameState, setGameState] = useState(null);
	const [playerScores, setPlayerScores] = useState({
		player1: 0,
		player2: 0,
	});
	const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });
	const [isMovingUp, setIsMovingUp] = useState(false);
	const [isMovingDown, setIsMovingDown] = useState(false);
	const [paddles, setPaddles] = useState({ paddle1Y: 50, paddle2Y: 50 });
	const [countdown, setCountdown] = useState(3);

	const scalePosition = (x: number, y: number) => {
		const scaledX = (x / 300) * 100; // Scale based on game board width
		const scaledY = (y / 100) * 100; // Scale based on game board height
		return { x: scaledX, y: scaledY };
	};

	useEffect(() => {
		chatSocket.emit("change-status", IN_GAME);
	}, [chatSocket]);

	useEffect(() => {
		let timerId: number | undefined;
		if (countdown > 0) {
			// Set a timer to decrement the countdown
			timerId = setTimeout(() => setCountdown(countdown - 1), 1000);
			return () => clearTimeout(timerId);
		} else if (countdown === 0) {
			return () => clearTimeout(timerId);
		}
	}, [countdown]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "ArrowUp") {
				setIsMovingUp(true);
			} else if (event.key === "ArrowDown") {
				setIsMovingDown(true);
			}
		};

		const handleKeyUp = (event: KeyboardEvent) => {
			if (event.key === "ArrowUp") {
				setIsMovingUp(false);
			} else if (event.key === "ArrowDown") {
				setIsMovingDown(false);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, []);

	useEffect(() => {
		const movePaddle = () => {
			if (isMovingUp || isMovingDown) {
				const direction = isMovingUp ? "up" : "down";
				gameSocket.emit("move-paddle", { direction });
			}
		};

		const intervalId = setInterval(movePaddle, 16.66666); // 60 FPS

		return () => {
			clearInterval(intervalId);
		};
	}, [isMovingUp, isMovingDown, gameSocket]);

	useEffect(() => {
		gameSocket.on(
			"paddlePosition",
			(response: { P1: number; P2: number }) => {
				const { P1, P2 } = response;
				setPaddles((prevPaddles) => ({
					...prevPaddles,
					paddle1Y: P1,
				}));
				setPaddles((prevPaddles) => ({
					...prevPaddles,
					paddle2Y: P2,
				}));
			},
		);

		gameSocket.on(
			"pointScored",
			(response: { scoreP1: number; scoreP2: number }) => {
				const { scoreP1, scoreP2 } = response;
				playerScores.player1 = scoreP1;
				playerScores.player2 = scoreP2;
				setPlayerScores((prevPlayerScores) => ({
					...prevPlayerScores,
					player1: scoreP1,
				}));
				setPlayerScores((prevPlayerScores) => ({
					...prevPlayerScores,
					player2: scoreP2,
				}));
			},
		);

		gameSocket.on("ballPosition", (response: { x: number; y: number }) => {
			const { x, y } = response;
			const scaledPos = scalePosition(x, y);
			setBallPosition(scaledPos);
		});

		return () => {
			gameSocket.off("ballPosition");
			gameSocket.off("paddlePosition");
			gameSocket.off("pointScored");
		};
	}, [gameSocket, playerScores]);

	return (
		<div className={styles.game}>
			{countdown > 0 && (
				<div className={styles.countdown}>{countdown}</div>
			)}
			<div>
				<div
					className={styles.ball}
					style={{
						left: `${ballPosition.x}%`,
						top: `${ballPosition.y}%`,
					}}
				/>
				<div
					className={styles.paddle}
					style={{ top: `${paddles.paddle1Y}%` }}
				/>
				<div
					className={styles.paddle}
					style={{ top: `${paddles.paddle2Y}%` }}
				/>
				<div className={styles.score}>{playerScores.player1}</div>
				<div className={styles.score}>{playerScores.player2}</div>
			</div>
		</div>
	);
};

export default PongGame;
