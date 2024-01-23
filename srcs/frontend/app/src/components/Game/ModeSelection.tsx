import { Slider, Text } from "@mantine/core";
import React, { useEffect, useState } from "react";
import styles from "./ModeSelection.module.css";
import { useAtom } from "jotai";
import { gameSettingsAtom } from "../../context/atoms";

const ballMarks = [
	{ value: 1, label: "Very slow" },
	{ value: 2, label: "Slow" },
	{ value: 3, label: "Normal" },
	{ value: 4, label: "Fast" },
	{ value: 5, label: "Very Fast" },
];

const paddleMarks = [
	{ value: 10, label: "Very small" },
	{ value: 15, label: "Small" },
	{ value: 20, label: "Medium" },
	{ value: 25, label: "Large" },
	{ value: 30, label: "Very large" },
];

const SettingsComponent: React.FC = () => {
	const [, setSettings] = useAtom(gameSettingsAtom);
	const [ballSpeed, setBallSpeed] = useState(3);
	const [paddleSize, setPaddleSize] = useState(20);
	// const [rainbowMode, setRainbowMode] = useState(false);

	// Update  component on settings change
	useEffect(() => {
		setSettings({
			ballSpeed,
			paddleSize,
			// rainbowMode,
		});
	}, [ballSpeed, paddleSize, setSettings]);

	return (
		<div className={styles.container}>
			<div className={styles.settingRow}>
				<Text className={styles.labelText}>Ball Speed</Text>
				<Slider
					defaultValue={3}
					onChangeEnd={setBallSpeed}
					label={(val) =>
						ballMarks.find((mark) => mark.value === val)!.label
					}
					marks={ballMarks}
					min={1}
					max={5}
					step={1}
					styles={{ markLabel: { display: "none" } }}
				/>
			</div>

			<div className={styles.settingRow}>
				<Text className={styles.labelText}>Paddle Size</Text>
				<Slider
					className={styles.slider}
					defaultValue={20}
					onChangeEnd={setPaddleSize}
					label={(val) =>
						paddleMarks.find((mark) => mark.value === val)!.label
					}
					marks={paddleMarks}
					min={10}
					max={30}
					step={5}
					styles={{ markLabel: { display: "none" } }}
				/>
			</div>

			{/* <div className={styles.settingRow}>
				<Text className={styles.labelText}>Rainbow mode</Text>
				<Checkbox
					checked={rainbowMode}
					onChange={(event) =>
						setRainbowMode(event.currentTarget.checked)
					}
				/>
			</div> */}
		</div>
	);
};

export default SettingsComponent;
