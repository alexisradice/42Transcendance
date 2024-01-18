import { createContext, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import { SocketContextType } from "../types";

interface Props {
	children: React.ReactNode;
}

export const SocketContext = createContext<SocketContextType>(
	{} as SocketContextType,
);

export const SocketProvider: React.FC<Props> = ({ children }) => {
	const gameSocket = useSocket("game");
	const [isPending, setIsPending] = useState(false);

	const value = {
		gameSocket,
		isPending,
		setIsPending,
	};

	return (
		<SocketContext.Provider value={value}>
			{children}
		</SocketContext.Provider>
	);
};
