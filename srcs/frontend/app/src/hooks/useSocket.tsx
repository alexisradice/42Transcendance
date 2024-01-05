import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

export const useSocket = (namespace: string) => {
	const [client, setClient] = useState<Socket | null>(null);
	useEffect(() => {
		setClient(
			io(`${import.meta.env.VITE_API_URL}/${namespace}`, {
				withCredentials: true,
			}),
		);
	}, [namespace]);
	return client;
};
