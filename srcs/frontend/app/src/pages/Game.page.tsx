import { notifications } from "@mantine/notifications";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { validate } from "uuid";
import PongGame from "../components/Game/PongGame";
import { ONLINE } from "../constants";
import { useSocketContext } from "../context/useContextGameSocket";
import { useSocket } from "../hooks/useSocket";
import { SocketResponse } from "../types";

export const GamePage = () => {
	const { lobbyId } = useParams();
	const navigate = useNavigate();
	const { gameSocket } = useSocketContext();
	const chatSocket = useSocket("chat");

	useEffect(() => {
		const quitGame = () => {
			chatSocket.emit("change-status", ONLINE);
			navigate("/");
		};

		gameSocket.on("gameOver", (response) => {
			const { winner } = response;
			notifications.show({
				title: "Game Over",
				message: `Winner is ${winner}`,
				color: "blue",
			});
			quitGame();
		});

		if (!lobbyId || !validate(lobbyId)) {
			notifications.show({
				title: "Error",
				message: "Lobby does not exist",
				color: "red",
			});
			quitGame();
		} else {
			gameSocket.emit(
				"verify-lobby",
				{ lobbyId },
				(response: SocketResponse<undefined>) => {
					if (response.error) {
						notifications.show({
							title: "Error",
							message: "Lobby does not exist",
							color: "red",
						});
						quitGame();
					}
				},
			);
		}

		return () => {
			gameSocket.off("gameOver");
		};
	}, [gameSocket, navigate, lobbyId, chatSocket]);

	return <PongGame />;
};
