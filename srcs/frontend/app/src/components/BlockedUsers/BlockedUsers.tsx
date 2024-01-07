import useSWR from "swr";
import { User } from "../../types";
import { axiosPrivate, fetcherPrivate } from "../../utils/fetcher";
import {
	Box,
	Center,
	Divider,
	Group,
	Loader,
	ScrollArea,
	Stack,
	Text,
	UnstyledButton,
} from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { errorNotif } from "../../utils/errorNotif";
import { useState } from "react";

const BlockedUsers = () => {
	const [loading, setLoading] = useState(false);
	const {
		data: blockedUsers,
		error,
		isLoading,
		mutate,
	} = useSWR("/user/blocked/all", fetcherPrivate);

	const unblockUser = async (userLogin: string) => {
		if (window.confirm("Are you sure you want to unblock this user?")) {
			setLoading(true);
			try {
				await axiosPrivate.post("/user/unblock", {
					userLogin: userLogin,
				});
				await mutate(
					...blockedUsers.filter(
						(user: User) => user.login !== userLogin,
					),
				);
			} catch (e: unknown) {
				errorNotif(e);
			} finally {
				setLoading(false);
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
					<ScrollArea.Autosize mah={200} type="scroll">
						<Stack>
							{blockedUsers.map(
								(blockedUser: User, index: number) => (
									<UnstyledButton
										key={index}
										onClick={() => {
											unblockUser(blockedUser.login);
										}}
										disabled={loading}
										c={loading ? "dimmed" : undefined}
									>
										<Group>
											<IconX size={16} />
											<Text>{blockedUser.login}</Text>
										</Group>
									</UnstyledButton>
								),
							)}
						</Stack>
					</ScrollArea.Autosize>
				</Box>
			)}
		</>
	);
};

export default BlockedUsers;
