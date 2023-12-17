import { Link } from "react-router-dom";
import ColorSchemeToggle from "../ColorSchemeToggle/ColorSchemeToggle";
import LoginButton from "../LoginButton/LoginButton";
import UserMenu from "../UserMenu/UserMenu";
import classes from "./Header.module.css";

export default function Header() {
	const isAuthenticated = false;
	return (
		<div className={classes.header}>
			<div className={classes.subsection}>
				<Link to="/">Pongu!</Link>
			</div>
			<div className={classes.subsection}>
				{isAuthenticated ? (
					<>
						<div>Howdy, lmurtin</div>
						<UserMenu>
							<img
								className={classes.avatar}
								src="/avatar.webp"
								alt="avatar"
								height="50"
								width="50"
							/>
						</UserMenu>
					</>
				) : (
					<LoginButton />
				)}
				<ColorSchemeToggle />
			</div>
		</div>
	);
}
