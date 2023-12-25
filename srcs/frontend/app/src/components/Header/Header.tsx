import { Link } from "react-router-dom";
import ColorSchemeToggle from "../ColorSchemeToggle/ColorSchemeToggle";
import UserMenu from "../UserMenu/UserMenu";
import classes from "./Header.module.css";
import useSWR from "swr";
import { fetcherPrivate } from "../../utils/fetcher";
import { Loader } from "@mantine/core";

type Props = {
	setIsLogged: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Header({ setIsLogged }: Props) {
	const { data, error, isLoading } = useSWR("/user/me", fetcherPrivate);
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
						<div>Howdy, {data.displayName}</div>
						<UserMenu setIsLogged={setIsLogged}>
							<img
								className={classes.avatar}
								src={data.image}
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
