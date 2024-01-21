import { useEffect, useState } from "react";
import PongGame from "../components/Game/PongGame";
import { useSocketContext } from "../context/useContextGameSocket";
import { useNavigate, useParams } from "react-router-dom";
import { validate } from "uuid";
import { SocketResponse } from "../types";
import { notifications } from "@mantine/notifications";
import { Modal } from "@mantine/core";

export const GamePage = () => {
	const { lobbyId } = useParams();
	const navigate = useNavigate();
	const [gameOverMessage, setGameOverMessage] = useState("");
	const { gameSocket } = useSocketContext();

	useEffect(() => {
		gameSocket.on("gameOver", (response) => {
			const { winner } = response;
			setGameOverMessage(`Winner is ${winner}`);
		});

		if (!lobbyId || !validate(lobbyId)) {
			notifications.show({
				title: "Error",
				message: "Lobby does not exist",
				color: "red",
			});
			navigate("/");
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
						navigate("/");
					}
				},
			);
		}

		return () => {
			gameSocket.off("gameOver");
		};
	}, [gameSocket, navigate, lobbyId]);

	return (
		<>
			<Modal
				radius="md"
				centered={true}
				opened={!!gameOverMessage}
				onClose={() => {
					navigate("/");
				}}
				title="Game Over"
				overlayProps={{
					backgroundOpacity: 0.55,
					blur: 3,
				}}
			>
				{gameOverMessage}
			</Modal>
			<PongGame />
		</>
	);
};
