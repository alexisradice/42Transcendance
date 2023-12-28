import { Avatar, Image, Loader } from "@mantine/core";
import { Link } from "react-router-dom";
import { LOGO_SIZE } from "../../constants";
import { useMyData } from "../../hooks/useMyData";
import { errorNotif } from "../../utils/errorNotif";
import ColorSchemeToggle from "../ColorSchemeToggle/ColorSchemeToggle";
import UserMenu from "../UserMenu/UserMenu";
import classes from "./Header.module.css";

type Props = {
	setIsLogged: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Header({ setIsLogged }: Props) {
	const { user, error, isLoading } = useMyData();
	if (error) {
		errorNotif(error);
	}
	const getImageSrc = (image: string) => {
		if (image.startsWith("http")) {
			return image;
		}
		return `data:image/jpeg;base64,${image}`;
	};
	return (
		<div className={classes.header}>
			<div className={classes.subsection}>
				<Link to="/">
					<Image
						src={"/pongu.png"}
						radius="md"
						h={LOGO_SIZE}
						w={LOGO_SIZE}
					/>
				</Link>
			</div>
			<div className={classes.subsection}>
				{error && <></>}
				{!error && isLoading && <Loader size="xs"></Loader>}
				{!error && !isLoading && (
					<>
						<div>Howdy, {user.displayName}</div>
						<UserMenu setIsLogged={setIsLogged}>
							<Avatar
								src={getImageSrc(user.image)}
								alt="avatar"
								size="lg"
								className={classes.avatar}
							/>
						</UserMenu>
					</>
				)}
				<ColorSchemeToggle />
			</div>
		</div>
	);
}
