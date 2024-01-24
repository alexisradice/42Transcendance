import { Checkbox, Group, Slider, Text } from "@mantine/core";
import React, { useEffect, useState } from "react";
import classes from "./ModeSelection.module.css";
import { useAtom } from "jotai";
import { gameSettingsAtom, rainbowModeAtom } from "../../context/atoms";

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
	const [rainbowMode, setRainbowMode] = useAtom(rainbowModeAtom);

	// Update  component on settings change
	useEffect(() => {
		setSettings({
			ballSpeed,
			paddleSize,
			// rainbowMode,
		});
	}, [ballSpeed, paddleSize, setSettings]);

	return (
		<div className={classes.container}>
			<div className={classes.settingRow}>
				<Text className={classes.labelText}>Ball Speed</Text>
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

			<div className={classes.settingRow}>
				<Text className={classes.labelText}>Paddle Size</Text>
				<Slider
					className={classes.slider}
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

			<div className={classes.settingRow}>
				<Group>
					<Checkbox
						id="rainbow-mode"
						checked={rainbowMode}
						onChange={(event) =>
							setRainbowMode(event.currentTarget.checked)
						}
					/>
					<label className={classes.labelText} htmlFor="rainbow-mode">
						Rainbow mode
						<span className={classes.epilepsyWarning}>
							epilepsy warning!
						</span>
					</label>
				</Group>
			</div>
		</div>
	);
};

export default SettingsComponent;
