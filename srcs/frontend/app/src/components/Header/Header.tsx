import { Link } from "react-router-dom";
import ColorSchemeToggle from "../ColorSchemeToggle/ColorSchemeToggle";
import UserMenu from "../UserMenu/UserMenu";
import classes from "./Header.module.css";
import useSWR from "swr";
import { fetcherPrivate } from "../../utils/fetcher";
import { errorNotif } from "../../utils/errorNotif";

type Props = {
	setIsLogged: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Header({ setIsLogged }: Props) {
	const { data, error } = useSWR("/user/me", fetcherPrivate);

	const { displayName, image } = data || {};
	if (error) {
		console.error(error);
		errorNotif();
	}
	return (
		<div className={classes.header}>
			<div className={classes.subsection}>
				<Link to="/">Pongu!</Link>
			</div>
			<div className={classes.subsection}>
				<div>Howdy, {displayName || ""}</div>
				<UserMenu setIsLogged={setIsLogged}>
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
