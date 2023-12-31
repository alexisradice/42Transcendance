import { Box, Group, Indicator, Avatar, Text } from "@mantine/core";
import { getStatusColor, getStatusText } from "../../utils/status";
import { Friend } from "../../types";
import classes from "./FriendCard.module.css";

type Props = {
	friend: Friend;
};

const FriendCard = ({ friend }: Props) => {
	return (
		<Box p="xs" className={classes.card}>
			<Group>
				<Indicator
					inline
					size={12}
					offset={7}
					position="bottom-end"
					color={getStatusColor(friend.status)}
				>
					<Avatar size="md" src={friend.image} />
				</Indicator>
				<Box visibleFrom="lg">
					{friend.displayName}
					<Text size="xs">{getStatusText(friend.status)}</Text>
				</Box>
			</Group>
		</Box>
	);
};

export default FriendCard;
