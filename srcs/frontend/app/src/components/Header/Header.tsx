import { Link } from 'react-router-dom';
import { Burger } from '@mantine/core';
import ColorSchemeToggle from '../ColorSchemeToggle/ColorSchemeToggle';
import classes from './Header.module.css';
import { useState } from 'react';

export default function Header() {
  const [opened, setOpened] = useState(false);
  const toggleOpened = () => setOpened((o) => !o);
  return (
    <div className={classes.header}>
      <div className={classes.subsection}>
        <Link to='/'>Pongu!</Link>
        <Burger opened={opened} onClick={toggleOpened} />
      </div>
      <div className={classes.subsection}>
        {/* <a href="http://localhost:3000/auth" target="_blank" rel="noopener noreferrer">Login</a> */}
        <div><Link to='/hello'>Howdy</Link>, lmurtin</div>
        <img className={classes.avatar} src='/avatar.webp' alt='avatar' height="50" width="50" />
        <ColorSchemeToggle />
      </div>
    </div>
  );
}
