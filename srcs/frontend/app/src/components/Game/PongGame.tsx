import { FC, useEffect, useState } from "react";
import styles from "./PongGame.module.css";
import { useSocketContext } from "../../context/useContextGameSocket";

interface Props {
	// lobbyId: string;
}

const PongGame: FC<Props> = () => {
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
				let newY = paddles.paddle1Y;
				const moveAmount = 2;

				if (isMovingUp) newY = Math.max(0, newY - moveAmount);
				if (isMovingDown) newY = Math.min(100, newY + moveAmount);

				//setPaddles(prevPaddles => ({ ...prevPaddles, paddle1Y: newY }));
				gameSocket.emit(isMovingUp ? "paddleUp" : "paddleDown", {});
			}
		};

		const intervalId = setInterval(movePaddle, 16); // 60 FPS

		return () => {
			clearInterval(intervalId);
		};
	}, [isMovingUp, isMovingDown, paddles.paddle1Y, gameSocket]);

	useEffect(() => {
		// let receivedPaddle1Y: any;
		// let receivedPaddle2Y: any;
		gameSocket.on(
			"paddleUpFront",
			(receivedPaddle1Y: any, receivedPaddle2Y: any) => {
				setPaddles((prevPaddles) => ({
					...prevPaddles,
					paddle1Y: receivedPaddle1Y,
				}));
				setPaddles((prevPaddles) => ({
					...prevPaddles,
					paddle2Y: receivedPaddle2Y,
				}));
			},
		);

		gameSocket.on("pointScored", (score1: number, score2: number) => {
			playerScores.player1 = score1;
			playerScores.player2 = score2;
			setPlayerScores((prevPlayerScores) => ({
				...prevPlayerScores,
				player1: score1,
			}));
			setPlayerScores((prevPlayerScores) => ({
				...prevPlayerScores,
				player2: score2,
			}));
		});

		gameSocket.on(
			"paddleDownFront",
			(receivedPaddle1Y: any, receivedPaddle2Y: any) => {
				setPaddles((prevPaddles) => ({
					...prevPaddles,
					paddle1Y: receivedPaddle1Y,
				}));
				setPaddles((prevPaddles) => ({
					...prevPaddles,
					paddle2Y: receivedPaddle2Y,
				}));
			},
		);

		gameSocket.on("ballPosition", (data: any) => {
			const scaledPos = scalePosition(data.x, data.y);
			setBallPosition(scaledPos);
		});

		return () => {
			gameSocket.off("ballPosition");
			gameSocket.off("paddleUpFront");
			gameSocket.off("pointScored");
			gameSocket.off("paddleDownFront");
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
