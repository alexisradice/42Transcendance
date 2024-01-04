import { useRef } from "react";
import { Socket, io } from "socket.io-client";

export const useSocket = (namespace: string) => {
	const socketRef = useRef<Socket>(
		io(`${import.meta.env.VITE_API_URL}/${namespace}`, {
			withCredentials: true,
		}),
	);
	const client = socketRef.current;
	return client;
};
