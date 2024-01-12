import React from 'react';
import { NumberInput, Slider, Text } from '@mantine/core';
import styles from './ModeSelection.module.css';

const marks = [
  { value: 0, label: 'small' },
  { value: 50, label: 'medium' },
  { value: 100, label: 'large' },
];

const SettingsComponent: React.FC = () => {
	return (
		<div className={styles.container}>
		  <NumberInput
			size="xs"
			radius="xs"
			label="Ball speed"
			placeholder="Set ball speed"
			defaultValue={2}
			min={0}
			max={5}
		  />
	
		  <Text className={styles.labelText}>Paddle size</Text>
		  <Slider
			defaultValue={50}
			label={(val) => marks.find((mark) => mark.value === val)?.label ?? ''}
			step={50}
			marks={marks}
			styles={{ markLabel: { display: 'none' } }}
		  />
		</div>
	  );
	};

export default SettingsComponent;
