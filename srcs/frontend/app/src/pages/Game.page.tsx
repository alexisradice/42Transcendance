import { useEffect, useState } from "react";
import PongGame from "../components/Game/PongGame";
import { useSocketContext } from "../context/useContextGameSocket";

export const GamePage = () => {
	const [gameOverMessage, setGameOverMessage] = useState("");
	const { gameSocket } = useSocketContext();

	useEffect(() => {
		gameSocket.on("gameOver", (winnerName) => {
			setGameOverMessage(`Game Over! Winner is ${winnerName}`);
			setTimeout(() => {
				window.location.href = "/";
			}, 3000);
		});

		return () => {
			gameSocket.off("gameOver");
		};
	}, [gameSocket]);

	if (gameOverMessage) {
		return (
			<div>
				<p>{gameOverMessage}</p>
			</div>
		);
	}

	return <PongGame />;
};
