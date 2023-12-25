import { Link } from "react-router-dom";
import ColorSchemeToggle from "../ColorSchemeToggle/ColorSchemeToggle";
import UserMenu from "../UserMenu/UserMenu";
import classes from "./Header.module.css";
import useSWR from "swr";
import { fetcherPrivate } from "../../utils/fetcher";
import { notifications } from "@mantine/notifications";

export default function Header() {
	const { data, error } = useSWR("/user/me", fetcherPrivate);
	const { displayName, image } = data || {};
	if (error) {
		notifications.show({
			title: "Uh oh! An error occurred.",
			message: error.message,
			color: "red",
		});
	}
	return (
		<div className={classes.header}>
			<div className={classes.subsection}>
				<Link to="/">Pongu!</Link>
			</div>
			<div className={classes.subsection}>
				<div>Howdy, {displayName || ""}</div>
				<UserMenu>
					<img
						className={classes.avatar}
						src={image}
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
