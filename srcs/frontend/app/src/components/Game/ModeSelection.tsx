import React, { useEffect, useState } from "react";
import { Input, NumberInput, Slider, Text, Select } from "@mantine/core";
import styles from "./ModeSelection.module.css";

const marks = [
	{ value: 0, label: "Small" },
	{ value: 50, label: "Medium" },
	{ value: 100, label: "Large" },
];

interface SettingsState {
	ballSpeed: number;
	paddleSize: string;
	visibility: string;
	inviteFriend: string;
	pause: boolean;
	mode: string;
}

const SettingsComponent: React.FC<{
	onSettingsChange: (settings: SettingsState) => void;
}> = ({ onSettingsChange }) => {
	const [ballSpeed, setBallSpeed] = useState(5);
	const [paddleSize, setPaddleSize] = useState(50);
	const [visibility, setVisibility] = useState("public");
	const [inviteFriend, setInviteFriend] = useState("");
	const [pause, setPause] = useState(true);
	const [mode, setMode] = useState("custom");

	// Update  component on settings change
	useEffect(() => {
		const newSettings = {
		  ballSpeed,
		  paddleSize:
			marks.find((mark) => mark.value === paddleSize)?.label || "Medium",
		  visibility,
		  inviteFriend,
		  pause,
		  mode,
		};
		//console.log('Updating Settings:', newSettings);
		onSettingsChange(newSettings);
	  }, [ballSpeed, paddleSize, visibility, inviteFriend, pause, mode, onSettingsChange]);

	const handleBallSpeedChange = (value: string | number) => {
		const numericValue = typeof value === 'string' ? parseInt(value, 10) : value;
		console.log('Ball Speed Changed:', numericValue); 
		setBallSpeed(numericValue);
		//updateSettings();
	  };

	const handlePaddleSizeChange = (value: number) => {
		setPaddleSize(value);
		//updateSettings();
	};


	const handleVisibilityChange = (value: string | null) => {
		setVisibility(value ?? "");
		//updateSettings();
	};


	const handleInviteFriendChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		setInviteFriend(event.target.value);
		//updateSettings();
	};

	const handlePauseChange = (value: string | null) => {
		setPause(value === "on");
		//updateSettings();
	  };

	const handleModeChange = (value: string | null) => {
		setMode(value ?? "classic");
		//updateSettings();
	};

	return (
		<div className={styles.container}>
			<div className={styles.settingRow}>
				<Text className={styles.labelText}>Ball Speed</Text>
				<NumberInput
					size="xs"
					radius="xs"
					placeholder="Set ball speed"
					value={ballSpeed}
					onChange={handleBallSpeedChange}
					min={0}
					max={5}
					style={{ width: "70%" }}
				/>
			</div>

			<div className={styles.settingRow}>
				<Text className={styles.labelText}>Paddle Size</Text>
				<Slider
					value={paddleSize}
					onChange={handlePaddleSizeChange}
					label={(val) =>
						marks.find((mark) => mark.value === val)?.label ?? ""
					}
					step={50}
					marks={marks}
					classNames={{ root: styles.sliderRoot }}
				/>
			</div>

			<div className={styles.settingRow}>
				<Text className={styles.labelText}>Visibility</Text>
				<Select
					placeholder="Select"
					value={visibility}
					onChange={handleVisibilityChange}
					data={[
						{ value: "public", label: "Public" },
						{ value: "private", label: "Private" },
					]}
					classNames={{ input: styles.selectRoot }}
				/>
			</div>
			<div className={styles.settingRow}>
				<Text className={styles.labelText}>Invite Friend</Text>
				<Input
					value={inviteFriend}
					onChange={handleInviteFriendChange}
					classNames={{ input: styles.inviteFriendInput }}
				/>
			</div>

			<div className={styles.settingRow}>
				<Text className={styles.labelText}>Pause</Text>
				<Select
					placeholder="Select"
					value={pause ? "on" : "off"}
					onChange={handlePauseChange}
					data={[
						{ value: "on", label: "On" },
						{ value: "off", label: "Off" },
					]}
					classNames={{ input: styles.selectRoot }}
				/>
			</div>

			<div className={styles.settingRow}>
				<Text className={styles.labelText}>Mode</Text>
				<Select
					placeholder="Select"
					value={mode}
					 onChange= {handleModeChange}
					data={[
						{ value: "Classic", label: "Classic" },
						{ value: "custom", label: "Custom" },
					]}
					classNames={{ input: styles.selectRoot }}
				/>
			</div>
		</div>
	);
};

export default SettingsComponent;
