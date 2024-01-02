import { Avatar, Box, Group, Indicator, Menu, Text, rem } from "@mantine/core";
import {
	IconChevronRight,
	IconDeviceGamepad2,
	IconMessageCircle,
} from "@tabler/icons-react";
import { Friend } from "../../types";
import { getStatusColor } from "../../utils/status";
import classes from "./FriendCard.module.css";

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
		<Menu position="right">
			<Menu.Target>
				<Box p="xs" className={classes.card}>
					<Group align="center">
						<Indicator
							inline
							size={14}
							offset={5}
							position="bottom-end"
							color={getStatusColor(friend.status)}
							withBorder
						>
							<Avatar src={friend.image} />
						</Indicator>
						<Box style={{ flex: 1 }} visibleFrom="lg">
							<Text size="md" fw={500}>
								{friend.displayName}
							</Text>

							<Text c="dimmed" size="sm">
								@{friend.login}
							</Text>
						</Box>
						<Box visibleFrom="lg">
							<IconChevronRight size="1rem" />
						</Box>
					</Group>
				</Box>
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
