import { Slider, Text } from "@mantine/core";
import React, { useEffect, useState } from "react";
import styles from "./ModeSelection.module.css";
import { useAtom } from "jotai";
import { gameSettingsAtom } from "../../context/atoms";

const ballMarks = [
	{ value: 1, label: "Very slow" },
	{ value: 1.5, label: "Slow" },
	{ value: 2, label: "Normal" },
	{ value: 2.5, label: "Fast" },
	{ value: 3, label: "Very Fast" },
];

const paddleMarks = [
	{ value: 0, label: "Small" },
	{ value: 50, label: "Medium" },
	{ value: 100, label: "Large" },
];

const SettingsComponent: React.FC = () => {
	const [, setSettings] = useAtom(gameSettingsAtom);
	const [ballSpeed, setBallSpeed] = useState(2);
	const [paddleSize, setPaddleSize] = useState(50);

	// Update  component on settings change
	useEffect(() => {
		setSettings({
			ballSpeed,
			paddleSize,
		});
	}, [ballSpeed, paddleSize, setSettings]);

	return (
		<div className={styles.container}>
			<div className={styles.settingRow}>
				<Text className={styles.labelText}>Ball Speed</Text>
				<Slider
					defaultValue={2}
					onChangeEnd={setBallSpeed}
					label={(val) =>
						ballMarks.find((mark) => mark.value === val)!.label
					}
					marks={ballMarks}
					min={1}
					max={3}
					step={0.5}
					styles={{ markLabel: { display: "none" } }}
				/>
			</div>

			<div className={styles.settingRow}>
				<Text className={styles.labelText}>Paddle Size</Text>
				<Slider
					className={styles.slider}
					defaultValue={50}
					onChangeEnd={setPaddleSize}
					label={(val) =>
						paddleMarks.find((mark) => mark.value === val)!.label
					}
					marks={paddleMarks}
					step={50}
					styles={{ markLabel: { display: "none" } }}
				/>
			</div>
		</div>
	);
};

export default SettingsComponent;
