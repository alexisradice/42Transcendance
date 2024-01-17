import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from '@mantine/core';
import classes from "./MainFrame.module.css";
import sendSettings from '../../utils/sendSettings';
import SettingsComponent from '../../components/Game/ModeSelection';
import { useSocketContext } from '../../context/SocketContext';

const MainFrame = () => {
    const { gameSocket, isPending, setIsPending } = useSocketContext();
    const navigate = useNavigate();
    const location = useLocation();

    const handlePlayGame = () => {
        setIsPending(true); // Show waiting message
        const settings = sendSettings();
        gameSocket.emit("queue", settings); // Player is trying to queue
        console.log("queue sent");
    };

    const handleCancel = () => {
        gameSocket.emit('cancel');
        setIsPending(false);
    };

	useEffect(() => {
		gameSocket.on('launch', (playerName, id) => {
			navigate(`/game?id=${id}`); // Navigate to the game page with the id
			setIsPending(false); 
		});
        return () => {
            gameSocket.off('launch');
        };
    }, [gameSocket, navigate]);

    return (
        <div className={classes.mainFrame}>
            {isPending && (
                <div className={classes.pendingContainer}>
                    <p>Waiting for a game to start...</p>
                    <Button onClick={handleCancel} color="red">Cancel</Button>
                </div>
            )}
            {location.pathname === '/' && !isPending && (
                <>
                    <Button className={classes.PlayButton} onClick={handlePlayGame}>
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
