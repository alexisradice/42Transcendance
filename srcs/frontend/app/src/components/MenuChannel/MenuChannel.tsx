import { Menu } from "@mantine/core";
import {
	IconDoorExit,
	IconPassword,
	IconSettings,
	IconShieldOff,
	IconShieldPlus,
} from "@tabler/icons-react";

type Props = {
	isOwner: boolean;
	hasPassword: boolean;
	// addPassword: () => void;
	// changePassword: () => void;
	// removePassword: () => void;
};

const MenuChannel = ({ isOwner, hasPassword }: Props) => {
	return (
		<Menu>
			<Menu.Target>
				<IconSettings />
			</Menu.Target>
			<Menu.Dropdown>
				{isOwner && (
					<>
						{!hasPassword ? (
							<Menu.Item
								leftSection={<IconShieldPlus size={18} />}
							>
								Add password
							</Menu.Item>
						) : (
							<>
								<Menu.Item
									leftSection={<IconPassword size={18} />}
								>
									Change password
								</Menu.Item>
								<Menu.Item
									leftSection={<IconShieldOff size={18} />}
								>
									Remove password
								</Menu.Item>
								<Menu.Divider />
							</>
						)}
					</>
				)}
				<Menu.Item color="red" leftSection={<IconDoorExit size={18} />}>
					Leave channel
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
};

export default MenuChannel;
