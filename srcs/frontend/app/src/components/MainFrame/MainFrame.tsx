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
                    <Button className={classes.PlayButton} onClick={goToGame}>
						Play Game
					</Button>
                    <div className={classes.settingsComponent}>
                        <SettingsComponent />
                    </div>
                </>
            )}
            <Outlet />
        </div>
    );
};

export default MainFrame;