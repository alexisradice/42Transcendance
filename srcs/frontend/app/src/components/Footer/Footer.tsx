import { Link } from 'react-router-dom';
import classes from './Footer.module.css';
import { Burger } from '@mantine/core';

const Footer = () => (
  <footer className={classes.footer}>
    <div>
      <Burger opened={false} />
    </div>
    <div>
      <Link to='/terms'>Terms</Link>{' - '}<Link to='/privacy'>Privacy</Link>
    </div>
    <div>
      <Burger opened={false} />
    </div>
  </footer>
);

export default Footer;
