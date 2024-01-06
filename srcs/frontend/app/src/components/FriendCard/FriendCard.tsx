import { Menu, rem } from "@mantine/core";
import { IconDeviceGamepad2, IconMessageCircle } from "@tabler/icons-react";
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
					leftSection={
						<IconMessageCircle
							style={{ width: rem(14), height: rem(14) }}
						/>
					}
					onClick={() => {
						openChat(friend.login);
					}}
				>
					Messages
				</Menu.Item>
				<Menu.Item
					leftSection={
						<IconDeviceGamepad2
							style={{ width: rem(14), height: rem(14) }}
						/>
					}
				>
					Invite to play
				</Menu.Item>
				<Menu.Item color="red" onClick={handleRemove}>
					Remove friend
				</Menu.Item>
				<Menu.Item color="red" onClick={handleBlock}>
					Block friend
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
};

export default FriendCard;
