import { Menu } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { axiosPrivate } from "../../utils/fetcher";
import SettingsModal from "../SettingsModal/SettingsModal";
import { errorNotif } from "../../utils/errorNotif";

type Props = {
	children: JSX.Element;
	setIsLogged: React.Dispatch<React.SetStateAction<boolean>>;
};

const UserMenu = ({ children, setIsLogged }: Props) => {
	const [opened, { open, close }] = useDisclosure(false);

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
			<SettingsModal opened={opened} close={close} />
			<Menu shadow="md" width={150}>
				<Menu.Target>{children}</Menu.Target>
				<Menu.Dropdown>
					<Menu.Item onClick={open}>Settings</Menu.Item>
					<Menu.Item>Stats</Menu.Item>
					<Menu.Item onClick={logOut}>Log out</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</>
	);
};

export default UserMenu;
