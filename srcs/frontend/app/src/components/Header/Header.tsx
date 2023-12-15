import { Link } from 'react-router-dom';
import { ColorSchemeToggle } from '../ColorSchemeToggle/ColorSchemeToggle';
import classes from './Header.module.css';

export default function Header() {
  return (
    <div className={classes.header}>
      <div className={classes.title}>
        <Link to='/'>Pongu!</Link>
      </div>
      <div className={classes.userSection}>
        <div>Howdy, lmurtin</div>
        <img className={classes.avatar} src='/avatar.webp' alt='avatar' height="50" width="50" />
        <ColorSchemeToggle />
      </div>
    </div>
  );
}
