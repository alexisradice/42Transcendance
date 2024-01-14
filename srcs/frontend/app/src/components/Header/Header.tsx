import { Avatar, Box, Burger, Group, Image, Loader } from "@mantine/core";
import { Link } from "react-router-dom";
import { LOGO_SIZE } from "../../constants";
import { useMyData } from "../../hooks/useMyData";
import ColorSchemeToggle from "../ColorSchemeToggle/ColorSchemeToggle";
import UserMenu from "../UserMenu/UserMenu";
import classes from "./Header.module.css";

type Props = {
	leftSectionOpened: boolean;
	toggleLeftSection: () => void;
	chatOpened: boolean;
	selectedChannel: boolean;
	setIsLogged: React.Dispatch<React.SetStateAction<boolean>>;
	setChatOpened: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Header({
	leftSectionOpened,
	toggleLeftSection,
	chatOpened,
	selectedChannel,
	setIsLogged,
	setChatOpened,
}: Props) {
	const { user, error, isLoading } = useMyData();
	return (
		<Group justify="space-between">
			<Group>
				<Burger
					opened={leftSectionOpened}
					onClick={toggleLeftSection}
					aria-label="Toggle navigation"
				/>
				<ColorSchemeToggle />
				<Link to="/">
					<Group>
						<Image
							src={"/pongu.png"}
							radius="md"
							h={LOGO_SIZE}
							w={LOGO_SIZE}
						/>
					</Group>
				</Link>
			</Group>
			<Group>
				{error && <></>}
				{!error && isLoading && <Loader type="dots" />}
				{!error && !isLoading && user && (
					<>
						<Box visibleFrom="sm">Howdy, {user.displayName}</Box>
						<UserMenu setIsLogged={setIsLogged}>
							<Avatar
								src={user.image}
								alt="avatar"
								size="lg"
								className={classes.avatar}
							/>
						</UserMenu>
						{selectedChannel && (
							<Burger
								opened={chatOpened}
								onClick={() => setChatOpened(!chatOpened)}
								aria-label="Toggle navigation"
							/>
						)}
					</>
				)}
			</Group>
		</Group>
	);
}
