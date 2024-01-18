import React, { createContext, useContext, useState } from 'react';
import { useSocket } from "../hooks/useSocket"; // Import your useSocket hook

export const SocketContext = createContext();

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const gameSocket = useSocket("game");
    const [isPending, setIsPending] = useState(false);

    const value = {
        gameSocket,
        isPending,
        setIsPending
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
