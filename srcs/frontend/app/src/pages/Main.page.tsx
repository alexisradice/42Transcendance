import { useState } from "react";
import LoggedView from "../components/LoggedView/LoggedView";
import LoginModal from "../components/LoginModal/LoginModal";
import { isLoggedCookie } from "../utils/readCookie";
import { SocketProvider } from "../context/SocketContext";

export function MainPage() {
	const [isLogged, setIsLogged] = useState(isLoggedCookie());

	return (
		<>
			{isLogged ? (
				<SocketProvider>
					<LoggedView setIsLogged={setIsLogged} />
				</SocketProvider>
			) : (
				<LoginModal setIsLogged={setIsLogged} />
			)}
		</>
	);
}
