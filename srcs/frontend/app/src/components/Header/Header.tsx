import { Link } from "react-router-dom";
import ColorSchemeToggle from "../ColorSchemeToggle/ColorSchemeToggle";
import UserMenu from "../UserMenu/UserMenu";
import classes from "./Header.module.css";
import { Loader } from "@mantine/core";
import { useMyData } from "../../hooks/useMyData";
import { errorNotif } from "../../utils/errorNotif";

type Props = {
	setIsLogged: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Header({ setIsLogged }: Props) {
	const { user, error, isLoading } = useMyData();
	if (error) {
		errorNotif(error);
	}
	return (
		<div className={classes.header}>
			<div className={classes.subsection}>
				<Link to="/">Pongu!</Link>
			</div>
			<div className={classes.subsection}>
				{error && <></>}
				{!error && isLoading && <Loader size="xs"></Loader>}
				{!error && !isLoading && (
					<>
						<div>Howdy, {user.displayName}</div>
						<UserMenu setIsLogged={setIsLogged}>
							<img
								className={classes.avatar}
								src={user.image}
								alt="avatar"
								height="50"
								width="50"
							/>
						</UserMenu>
					</>
				)}
				<ColorSchemeToggle />
			</div>
		</div>
	);
}
