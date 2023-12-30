import { Menu } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { axiosPrivate } from "../../utils/fetcher";
import ProfileSettings from "../ProfileSettings/ProfileSettings";
import { errorNotif } from "../../utils/errorNotif";
import AccountSettings from "../AccountSettings/AccountSettings";

type Props = {
	children: JSX.Element;
	setIsLogged: React.Dispatch<React.SetStateAction<boolean>>;
};

const UserMenu = ({ children, setIsLogged }: Props) => {
	const [profileOpened, { open: openProfile, close: closeProfile }] =
		useDisclosure(false);
	const [accountOpened, { open: openAccount, close: closeAccount }] =
		useDisclosure(false);

	const logOut = async () => {
		try {
			await axiosPrivate.patch("/auth/logout");
			setIsLogged(false);
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
