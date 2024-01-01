import useSWR from "swr";
import { User } from "../../types";
import { axiosPrivate, fetcherPrivate } from "../../utils/fetcher";
import { Box, Center, Divider, Group, Loader, Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import classes from "./BlockedUsers.module.css";
import { errorNotif } from "../../utils/errorNotif";

const BlockedUsers = () => {
	const {
		data: blockedUsers,
		error,
		isLoading,
		mutate,
	} = useSWR("/user/blocked/all", fetcherPrivate);

	const unblockUser = async (userLogin: string) => {
		if (window.confirm("Are you sure you want to unblock this user?")) {
			try {
				await axiosPrivate.post("/user/unblock", {
					userLogin: userLogin,
				});
				mutate([...blockedUsers]);
			} catch (e: unknown) {
				errorNotif(e);
			}
		}
	};

	return (
		<>
			<Divider mt="lg" mb="lg" />
			<Text>Blocked users</Text>
			{!error && isLoading && (
				<Center>
					<Loader type="dots" />
				</Center>
			)}
			{!error && !isLoading && (
				<Box mt="md">
					{blockedUsers.map((blockedUser: User, index: number) => (
						<Group key={index}>
							<IconX
								className={classes.unblockIcon}
								onClick={() => unblockUser(blockedUser.login)}
								size={16}
							/>
							<Text>{blockedUser.login}</Text>
						</Group>
					))}
				</Box>
			)}
		</>
	);
};

export default BlockedUsers;
