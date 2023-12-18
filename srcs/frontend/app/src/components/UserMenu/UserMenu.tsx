import { Menu } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useContext } from "react";
import { AuthContext, IAuthContext } from "react-oauth2-code-pkce";
import SettingsModal from "../SettingsModal/SettingsModal";

type Props = {
	children: JSX.Element;
};

const UserMenu = ({ children }: Props) => {
	const [opened, { open, close }] = useDisclosure(false);
	const context = useContext<IAuthContext>(AuthContext);

	const logOut = () => {
		context.logOut();
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
