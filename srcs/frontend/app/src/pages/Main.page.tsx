import { useState } from "react";
import LoggedView from "../components/LoggedView/LoggedView";
import LoginModal from "../components/LoginModal/LoginModal";
import { isLoggedCookie } from "../utils/readCookie";

export function MainPage() {
	const [isLogged, setIsLogged] = useState(isLoggedCookie());

	return (
		<>
			{isLogged ? (
				<LoggedView setIsLogged={setIsLogged} />
			) : (
				<LoginModal setIsLogged={setIsLogged} />
			)}
		</>
	);
}
