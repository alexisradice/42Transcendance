import { Menu } from "@mantine/core";
import {
	IconBan,
	IconDeviceGamepad2,
	IconMessageCircle,
	IconTrash,
} from "@tabler/icons-react";
import { Friend } from "../../types";
import UserCard from "../UserCard/UserCard";

type Props = {
	friend: Friend;
	openChat: (friendLogin: string) => void;
	removeFriend: (friendLogin: string) => void;
	blockFriend: (friendLogin: string) => void;
};

const FriendCard = ({ friend, openChat, removeFriend, blockFriend }: Props) => {
	const handleRemove = () => {
		if (
			window.confirm(`Are you sure you want to remove ${friend.login}?`)
		) {
			removeFriend(friend.login);
		}
	};
	const handleBlock = () => {
		if (
			window.confirm(
				`Are you sure you want to block ${friend.login}? This will also remove them from your friends list.`,
			)
		) {
			blockFriend(friend.login);
		}
	};
	return (
		<Menu>
			<Menu.Target>
				<UserCard user={friend} chevron={true} />
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Item
					leftSection={<IconMessageCircle size={18} />}
					onClick={() => {
						openChat(friend.login);
					}}
				>
					Messages
				</Menu.Item>
				<Menu.Item leftSection={<IconDeviceGamepad2 size={18} />}>
					Invite to play
				</Menu.Item>
				<Menu.Item
					color="red"
					onClick={handleRemove}
					leftSection={<IconTrash size={18} />}
				>
					Remove friend
				</Menu.Item>
				<Menu.Item
					color="red"
					onClick={handleBlock}
					leftSection={<IconBan size={18} />}
				>
					Block friend
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
};

export default FriendCard;
