import { Drawer } from '@mantine/core';
import { useState } from 'react';
// import classes from './LeftDrawer.module.css';

export default function LeftDrawer() {
  const [opened, setOpened] = useState(true);

  const onClose = () => {
    setOpened(false);
  };

  return (
    <Drawer opened={opened} onClose={onClose} />
  );
}
