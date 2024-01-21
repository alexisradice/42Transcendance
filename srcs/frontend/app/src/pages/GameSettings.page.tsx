import { Button } from "@mantine/core";
import { useState } from "react";
import SettingsComponent from "../components/Game/ModeSelection";
import { useSocketContext } from "../context/useContextGameSocket";
import sendSettings from "../utils/sendSettings";
import classes from "./GameSettings.module.css";
import { SettingsType } from "../types";

const GameSettings = () => {
	const { gameSocket, isPending, setIsPending } = useSocketContext();

	const [settings, setSettings] = useState({
		ballSpeed: 5,
		paddleSize: "medium",
		visibility: "public",
		inviteFriend: "yes",
		pause: true,
		mode: "classic",
	});

	const handleSettingsChange = (newSettings: SettingsType) => {
		setSettings(newSettings); // Update the settings state
	};

	const handlePlayGame = () => {
		setIsPending(true); // Show waiting message
		sendSettings(settings);
		gameSocket.emit("queue", settings); // Player is trying to queue
	};

	const handleCancel = () => {
		gameSocket.emit("leave-lobby");
		setIsPending(false);
	};

	return (
		<div className={classes.container}>
			{isPending ? (
				<div className={classes.pendingContainer}>
					<p>Waiting for a game to start...</p>
					<Button onClick={handleCancel} color="red">
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
					<div className={classes.settingsComponent}>
						<SettingsComponent
							onSettingsChange={handleSettingsChange}
						/>
					</div>
				</>
			)}
		</div>
	);
};

export default GameSettings;
