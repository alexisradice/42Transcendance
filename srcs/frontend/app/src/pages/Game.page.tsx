import { useEffect, useState } from "react";
import PongGame from "../components/Game/PongGame";
import { useSocketContext } from "../context/useContextGameSocket";
import { useNavigate } from "react-router-dom";

export const GamePage = () => {
	const navigate = useNavigate();
	const [gameOverMessage, setGameOverMessage] = useState("");
	const { gameSocket } = useSocketContext();

	useEffect(() => {
		gameSocket.on("gameOver", (winnerName) => {
			setGameOverMessage(`Game Over! Winner is ${winnerName}`);
			setTimeout(() => {
				navigate("/");
			}, 3000);
		});

		return () => {
			gameSocket.off("gameOver");
		};
	}, [gameSocket, navigate]);

	if (gameOverMessage) {
		return (
			<div>
				<p>{gameOverMessage}</p>
			</div>
		);
	}

	return <PongGame />;
};
