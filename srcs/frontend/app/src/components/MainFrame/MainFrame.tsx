// MainFrame.tsx

import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from '@mantine/core';
import classes from "./MainFrame.module.css";
import SettingsComponent from '../../components/Game/ModeSelection'; // Removed the .tsx extension

const MainFrame = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const goToGame = () => {
        navigate('/game');
    };

    return (
        <div className={classes.mainFrame}>
            {location.pathname === '/' && (
                <>
                    <Button onClick={goToGame}>Play Game</Button>
                    <SettingsComponent />
                </>
            )}
            <Outlet />
        </div>
    );
};

export default MainFrame;
