import { Menu } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { errorNotif } from "../../utils/errorNotif";
import { axiosPrivate } from "../../utils/fetcher";
import AccountSettings from "../AccountSettings/AccountSettings";
import ProfileSettings from "../ProfileSettings/ProfileSettings";
import { useSocket } from "../../hooks/useSocket";
import { OFFLINE } from "../../constants";
import { useSocketContext } from "../../context/useContextGameSocket";

type Props = {
	children: JSX.Element;
	setIsLogged: React.Dispatch<React.SetStateAction<boolean>>;
};

const UserMenu = ({ children, setIsLogged }: Props) => {
	const chatSocket = useSocket("chat");
	const { gameSocket, setIsPending } = useSocketContext();
	const [profileOpened, { open: openProfile, close: closeProfile }] =
		useDisclosure(false);
	const [accountOpened, { open: openAccount, close: closeAccount }] =
		useDisclosure(false);

	const logOut = async () => {
		try {
			await axiosPrivate.patch("/auth/logout");

			chatSocket.emit("change-status", OFFLINE);
			setIsLogged(false);

			gameSocket.emit("leave-lobby");
			setIsPending(false);
		} catch (err: unknown) {
			errorNotif(err);
		}
	};

	return (
		<>
			<ProfileSettings opened={profileOpened} close={closeProfile} />
			<AccountSettings opened={accountOpened} close={closeAccount} />

			<Menu shadow="md" width={150}>
				<Menu.Target>{children}</Menu.Target>
				<Menu.Dropdown>
					<Menu.Item onClick={openProfile}>Profile</Menu.Item>
					<Menu.Item onClick={openAccount}>Account</Menu.Item>
					<Menu.Item onClick={logOut}>Log out</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</>
	);
};

export default UserMenu;
