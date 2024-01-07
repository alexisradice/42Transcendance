import { Menu } from "@mantine/core";
import {
	IconBan,
	IconDeviceGamepad2,
	IconHammer,
	IconKarate,
	IconMessageCircle,
	IconMessageOff,
	IconSword,
} from "@tabler/icons-react";
import { ChannelMember } from "../../types";
import UserCard from "../UserCard/UserCard";

type Props = {
	member: ChannelMember;
	memberRole: string;
	isOwner: boolean;
	isAdmin: boolean;
	isMe: boolean;
};

const ChannelMemberMenu = ({
	member,
	memberRole,
	isOwner,
	isAdmin,
	isMe,
}: Props) => {
	return (
		<>
			{isMe ? (
				<UserCard user={member} />
			) : (
				<Menu>
					<Menu.Target>
						<UserCard user={member} />
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Item
							leftSection={<IconMessageCircle size={18} />}
							onClick={() => {
								// openChat(member.login);
							}}
						>
							Messages
						</Menu.Item>
						<Menu.Item
							leftSection={<IconDeviceGamepad2 size={18} />}
						>
							Invite to play
						</Menu.Item>
						<Menu.Item
							color="red"
							leftSection={<IconBan size={18} />}
						>
							Block user
						</Menu.Item>
						{isOwner && memberRole === "member" && (
							<>
								<Menu.Divider />
								<Menu.Item
									leftSection={<IconSword size={18} />}
									color="green"
								>
									Promote to admin
								</Menu.Item>
							</>
						)}
						{(isOwner || isAdmin) && memberRole === "member" && (
							<>
								<Menu.Divider />
								<Menu.Item
									color="yellow"
									leftSection={<IconMessageOff size={18} />}
								>
									Mute (5mn)
								</Menu.Item>
								<Menu.Item
									color="red"
									leftSection={<IconKarate size={18} />}
								>
									Kick
								</Menu.Item>
								<Menu.Item
									color="red"
									leftSection={<IconHammer size={18} />}
								>
									Ban
								</Menu.Item>
							</>
						)}
					</Menu.Dropdown>
				</Menu>
			)}
		</>
	);
};

export default ChannelMemberMenu;
