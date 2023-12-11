import { Link } from 'react-router-dom';
import classes from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={classes.footer}>
      <Link to='/terms'>Terms</Link>{' - '}<Link to='/privacy'>Privacy</Link>
    </footer>
  );
}
