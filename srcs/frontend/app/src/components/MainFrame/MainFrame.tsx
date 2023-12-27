import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from '@mantine/core';
import classes from "./MainFrame.module.css";

const MainFrame = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const goToGame = () => {
        navigate('/game');
    };

    return (
        <div className={classes.mainFrame}>
            {location.pathname === '/' && (
                <Button onClick={goToGame}>Play Game</Button>
            )}
            <Outlet />
        </div>
    );
};

export default MainFrame;
