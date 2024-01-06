import { Avatar, Box, Group, Indicator, Text } from "@mantine/core";
import { IconChevronRight, TablerIconsProps } from "@tabler/icons-react";
import { getStatusColor } from "../../utils/status";
import { UserCard } from "../../types";
import classes from "./UserCard.module.css";
import { ReactElement } from "react";

type Props = {
	user: UserCard;
	chevron?: boolean;
	icon?: ReactElement<TablerIconsProps>;
};

const UserCard = ({ user, chevron, icon }: Props) => {
	return (
		<Box p="xs" className={classes.card}>
			<Group align="center">
				<Indicator
					inline
					size={14}
					offset={5}
					position="bottom-end"
					color={getStatusColor(user.status)}
					withBorder
				>
					<Avatar src={user.image} />
				</Indicator>
				<Box className="flex-1">
					<Group justify="flex-start" gap={5}>
						<Text size="md" fw={500}>
							{user.displayName}
						</Text>
						{icon}
					</Group>
					<Text c="dimmed" size="sm">
						@{user.login}
					</Text>
				</Box>
				{chevron && (
					<Box>
						<IconChevronRight size="1rem" />
					</Box>
				)}
			</Group>
		</Box>
	);
};

export default UserCard;
