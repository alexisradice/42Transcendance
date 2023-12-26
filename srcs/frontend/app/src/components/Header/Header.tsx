import { AspectRatio, Image, Loader } from "@mantine/core";
import { Link } from "react-router-dom";
import { AVATAR_SIZE } from "../../constants";
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
				<Link to="/">Pongu!</Link>
			</div>
			<div className={classes.subsection}>
				{error && <></>}
				{!error && isLoading && <Loader size="xs"></Loader>}
				{!error && !isLoading && (
					<>
						<div>Howdy, {user.displayName}</div>
						<UserMenu setIsLogged={setIsLogged}>
							<AspectRatio style={{ width: `${AVATAR_SIZE}px` }}>
								<Image
									radius="xl"
									h={AVATAR_SIZE}
									w={AVATAR_SIZE}
									className={classes.avatar}
									src={getImageSrc(user.image)}
									alt="avatar"
								/>
							</AspectRatio>
						</UserMenu>
					</>
				)}
				<ColorSchemeToggle />
			</div>
		</div>
	);
}
