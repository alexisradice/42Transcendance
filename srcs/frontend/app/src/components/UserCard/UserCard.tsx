import {
	Avatar,
	Box,
	Group,
	Indicator,
	Text,
	UnstyledButton,
} from "@mantine/core";
import { IconChevronRight, TablerIconsProps } from "@tabler/icons-react";
import { ReactElement, forwardRef } from "react";
import { GeneralUser } from "../../types";
import { getStatusColor } from "../../utils/status";
import classes from "./UserCard.module.css";

type Props = {
	user: GeneralUser;
	chevron?: boolean;
	icon?: ReactElement<TablerIconsProps>;
	hideStatus?: boolean;
	notif?: boolean;
};

const UserCard = forwardRef<HTMLButtonElement, Props>(
	({ user, chevron, icon, hideStatus, notif, ...others }: Props, ref) => {
		return (
			<UnstyledButton
				ref={ref}
				{...others}
				className={classes.card}
				mt="xs"
			>
				<Group align="center" wrap="nowrap">
					{notif ? (
						<Indicator
							inline
							processing
							color="red"
							size={12}
							offset={-12}
							position="middle-start"
						>
							<Avatar src={user.image} />
						</Indicator>
					) : (
						<Indicator
							inline
							size={14}
							offset={5}
							position="bottom-end"
							color={getStatusColor(user.status)}
							disabled={hideStatus}
							withBorder
						>
							<Avatar src={user.image} />
						</Indicator>
					)}

					<Box className="flex-1">
						<Group justify="flex-start" gap={5}>
							<Text className={classes.displayName}>
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
			</UnstyledButton>
		);
	},
);

export default UserCard;
