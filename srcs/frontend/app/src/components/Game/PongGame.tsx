import cx from "clsx";
import { FC, useEffect, useState } from "react";
import { IN_GAME } from "../../constants";
import { useSocketContext } from "../../context/useContextGameSocket";
import { useSocket } from "../../hooks/useSocket";
import classes from "./PongGame.module.css";

const PongGame: FC = () => {
	const chatSocket = useSocket("chat");
	const { gameSocket } = useSocketContext();
	const [playerScores, setPlayerScores] = useState({
		P1: 0,
		P2: 0,
	});
	const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });
	const [isMovingUp, setIsMovingUp] = useState(false);
	const [isMovingDown, setIsMovingDown] = useState(false);
	const [paddles, setPaddles] = useState({ P1: 50, P2: 50 });
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
				setPaddles({
					P1: P1,
					P2: P2,
				});
			},
		);

		gameSocket.on(
			"pointScored",
			(response: { scoreP1: number; scoreP2: number }) => {
				const { scoreP1, scoreP2 } = response;
				playerScores.P1 = scoreP1;
				playerScores.P2 = scoreP2;
				setPlayerScores({
					P1: scoreP1,
					P2: scoreP2,
				});
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
		<div className={classes.game}>
			{/* {countdown > 0 && (
				<div className={classes.countdown}>{countdown}</div>
			)} */}
			<div className={classes.score}>
				<div className={classes.player1Score}>{playerScores.P1}</div>
				<div className={classes.player2Score}>{playerScores.P2}</div>
			</div>
			<div
				className={classes.ball}
				style={{
					left: `${ballPosition.x}%`,
					top: `${ballPosition.y}%`,
					transform: `translate(${-ballPosition.x}%, ${-ballPosition.y}%)`,
				}}
				id="ball"
			></div>
			<div
				id="player1-paddle"
				className={cx(classes.paddle, classes.left)}
				style={{
					top: `${paddles.P1}%`,
					transform: `translateY(${paddles.P1}%))`,
				}}
			></div>
			<div
				id="player2-paddle"
				className={cx(classes.paddle, classes.right)}
				style={{
					top: `${paddles.P2}%`,
					transform: `translateY(${paddles.P2}%))`,
				}}
			></div>
		</div>
	);
};

export default PongGame;
