import { useState } from "react";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import LeftDrawer from "../components/LeftDrawer/LeftDrawer";
import LoginModal from "../components/LoginModal/LoginModal";
import MainFrame from "../components/MainFrame/MainFrame";
import RightDrawer from "../components/RightDrawer/RightDrawer";
import { isLoggedCookie } from "../utils/readCookie";
import classes from "./Main.module.css";

export function MainPage() {
	const [isLogged, setIsLogged] = useState(isLoggedCookie());

	return (
		<>
			{!isLogged && <LoginModal setIsLogged={setIsLogged} />}
			<div className={classes.main}>
				<div className={classes.header}>
					<Header />
				</div>
				<div className={classes.leftDrawer}>
					<LeftDrawer />
				</div>
				<main className={classes.mainFrame}>
					<MainFrame />
				</main>
				<div className={classes.rightDrawer}>
					<RightDrawer />
				</div>
				<div className={classes.footer}>
					<Footer />
				</div>
			</div>
		</>
	);
}
