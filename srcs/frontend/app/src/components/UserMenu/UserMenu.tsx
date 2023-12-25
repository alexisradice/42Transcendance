import { Menu } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { axiosPrivate } from "../../utils/fetcher";
import SettingsModal from "../SettingsModal/SettingsModal";
import { errorNotif } from "../../utils/errorNotif";
import { HttpException } from "../../utils/HttpException";

type Props = {
	children: JSX.Element;
	setIsLogged: React.Dispatch<React.SetStateAction<boolean>>;
};

const UserMenu = ({ children, setIsLogged }: Props) => {
	const [opened, { open, close }] = useDisclosure(false);

	const logOut = async () => {
		try {
			const response = await axiosPrivate.patch("/auth/logout");
			if (response.data.success) {
				setIsLogged(false);
			} else {
				throw new HttpException(
					"" + response.status,
					response.statusText,
				);
			}
		} catch (err) {
			console.error(err);
			errorNotif();
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
