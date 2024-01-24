import { Button, Text } from "@mantine/core";
import { useAtom } from "jotai";
import SettingsComponent from "../components/Game/ModeSelection";
import { IN_QUEUE, ONLINE } from "../constants";
import { useSocketContext } from "../context/useContextGameSocket";
import { useSocket } from "../hooks/useSocket";
import classes from "./GameSettings.module.css";
import { gameSettingsAtom } from "../context/atoms";
import { useCallback, useEffect } from "react";

const GameSettings = () => {
	const { gameSocket, isPending, setIsPending } = useSocketContext();
	const chatSocket = useSocket("chat");
	const [settings] = useAtom(gameSettingsAtom);

	const cleanLobby = useCallback(() => {
		gameSocket.emit("leave-lobby");
		chatSocket.emit("change-status", ONLINE);
		setIsPending(false);
	}, [gameSocket, chatSocket, setIsPending]);

	useEffect(() => {
		cleanLobby();
	}, [cleanLobby]);

	const handlePlayGame = () => {
		chatSocket.emit("change-status", IN_QUEUE);
		setIsPending(true); // Show waiting message
		gameSocket.emit("queue", { settings }); // Player is trying to queue
	};

	const handleCancel = () => {
		cleanLobby();
	};

	return (
		<div className={classes.container}>
			{isPending ? (
				<div className={classes.pendingContainer}>
					<Text size="xl">Waiting for a game to start...</Text>
					<Button onClick={handleCancel} color="red" mt="md">
						Cancel
					</Button>
				</div>
			) : (
				<>
					<Button
						className={classes.PlayButton}
						onClick={handlePlayGame}
					>
						Play Game
					</Button>
					<SettingsComponent />
				</>
			)}
		</div>
	);
};

export default GameSettings;
