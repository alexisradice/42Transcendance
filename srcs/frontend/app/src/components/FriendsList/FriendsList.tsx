import { Button, Center, Loader, ScrollArea, Stack, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import useSWR from "swr";
import { Friend } from "../../types";
import { fetcherPrivate } from "../../utils/fetcher";
import classes from "./FriendsList.module.css";

type Props = {
	height: number;
};

const FriendsList = ({ height }: Props) => {
	const {
		data: friends,
		error,
		isLoading,
	} = useSWR("/user/friends/all", fetcherPrivate);

	return (
		<>
			{error && <></>}
			{!error && isLoading && (
				<Center>
					<Loader />
				</Center>
			)}
			{!error && !isLoading && (
				<>
					{friends.length > 0 && (
						<ScrollArea h={height} type="scroll">
							<ul className={classes.list}>
								{friends.map(
									(friend: Friend, index: number) => {
										return (
											<li
												className={classes.friend}
												key={index}
											>
												{friend.displayName}
											</li>
										);
									},
								)}
							</ul>
						</ScrollArea>
					)}
					{friends.length === 0 && (
						<>
							<Stack
								justify="center"
								align="center"
								className={classes.noFriendStack}
							>
								<Text fs="italic">
									It's a bit empty around here.
								</Text>
								<Button
									color="cyan.7"
									leftSection={<IconPlus />}
								>
									Add friend
								</Button>
							</Stack>
						</>
					)}
				</>
			)}
		</>
	);
};

export default FriendsList;
