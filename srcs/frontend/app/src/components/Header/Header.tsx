import { Link } from 'react-router-dom';
import ColorSchemeToggle from '../ColorSchemeToggle/ColorSchemeToggle';
import classes from './Header.module.css';
import { Menu } from '@mantine/core';

export default function Header() {
  return (
    <div className={classes.header}>
      <div className={classes.subsection}>
        <Link to='/'>Pongu!</Link>
      </div>
      <div className={classes.subsection}>
        <div>Howdy, lmurtin</div>
        <Menu shadow='md' width={200}>
          <Menu.Target>
            <img className={classes.avatar} src='/avatar.webp' alt='avatar' height="50" width="50" />
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item>Settings</Menu.Item>
            <Menu.Item>Stats</Menu.Item>
            <Menu.Item>Log out</Menu.Item>
          </Menu.Dropdown>
        </Menu>
        <ColorSchemeToggle />
      </div>
    </div>
  );
}
