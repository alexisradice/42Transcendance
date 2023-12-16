import { Link } from "react-router-dom";
import ColorSchemeToggle from "../ColorSchemeToggle/ColorSchemeToggle";
import classes from "./Header.module.css";
import UserMenu from "../UserMenu/UserMenu";

export default function Header() {
	return (
		<div className={classes.header}>
			<div className={classes.subsection}>
				<Link to="/">Pongu!</Link>
			</div>
			<div className={classes.subsection}>
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
				<ColorSchemeToggle />
			</div>
		</div>
	);
}
