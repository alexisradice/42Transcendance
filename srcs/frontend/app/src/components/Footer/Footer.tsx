import { Link } from 'react-router-dom';
import classes from './Footer.module.css';

const Footer = () => (
  <footer className={classes.footer}>
    <Link to='/terms'>Terms</Link>{' - '}<Link to='/privacy'>Privacy</Link>
  </footer>
);

export default Footer;
