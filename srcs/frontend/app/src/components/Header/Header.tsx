import { Link } from 'react-router-dom';
import { ColorSchemeToggle } from '../ColorSchemeToggle/ColorSchemeToggle';
import classes from './Header.module.css';

export default function Header() {
  return (
    <div className={classes.header}>
      <div className={classes.title}>
        <Link to='/'>Pongu!</Link>
      </div>
      <a href="http://localhost:3000/auth">Login</a>
      <ColorSchemeToggle />
    </div>
  );
}
