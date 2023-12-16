import { Outlet } from 'react-router-dom';
import classes from './MainFrame.module.css';

const MainFrame = () => {
  return (
    <div className={classes.mainFrame}>
      <Outlet />
    </div>
  );
};

export default MainFrame;
