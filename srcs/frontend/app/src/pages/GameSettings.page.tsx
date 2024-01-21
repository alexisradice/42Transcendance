import { Button } from "@mantine/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SettingsComponent from "../components/Game/ModeSelection";
import { useSocketContext } from "../context/useContextGameSocket";
import sendSettings from "../utils/sendSettings";
import classes from "./GameSettings.module.css";

const GameSettings = () => {
	const { gameSocket, isPending, setIsPending } = useSocketContext();
	const navigate = useNavigate();

	const [settings, setSettings] = useState({
		ballSpeed: 5,
		paddleSize: "medium",
		visibility: "public",
		inviteFriend: "yes",
		pause: true,
		mode: "classic",
	});

	const handleSettingsChange = (newSettings: any) => {
		setSettings(newSettings); // Update the settings state
	};

	const handlePlayGame = () => {
		setIsPending(true); // Show waiting message
		sendSettings(settings);
		gameSocket.emit("queue", settings); // Player is trying to queue
		console.log("queue sent");
		console.log(settings);
	};

	const handleCancel = () => {
		gameSocket.emit("cancel");
		setIsPending(false);
	};

	useEffect(() => {
		gameSocket.on("launch", (playerName, id) => {
			navigate(`/game?id=${id}`); // Navigate to the game page with the id
			setIsPending(false);
		});
		return () => {
			gameSocket.off("launch");
		};
	}, [gameSocket, navigate, setIsPending]);

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
