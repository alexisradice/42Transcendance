import { Burger, Drawer } from '@mantine/core';
import { useState } from 'react';
// import classes from './LeftDrawer.module.css';

export default function LeftDrawer() {
  const [opened, setOpened] = useState(false);

  const onClose = () => {
    setOpened(false);
  };

  return (
    <>
      <Burger opened={opened} onClick={() => setOpened((o) => !o)} />
      <Drawer opened={opened} onClose={onClose} />
    </>
  );
}
