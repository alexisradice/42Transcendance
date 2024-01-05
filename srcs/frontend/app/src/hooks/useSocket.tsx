import { useRef } from "react";
import { Socket, io } from "socket.io-client";

export const useSocket = (namespace: string) => {
	const client = useRef<Socket | null>(null);

	if (client.current === null) {
		client.current = io(`${import.meta.env.VITE_API_URL}/${namespace}`, {
			withCredentials: true,
		});
	}

	return client.current;
};
