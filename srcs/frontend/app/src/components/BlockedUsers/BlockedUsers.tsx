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
import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { BlockedUser } from "../../types";
import { errorNotif } from "../../utils/errorNotif";
import { axiosPrivate, fetcherPrivate } from "../../utils/fetcher";

const BlockedUsers = () => {
	const { mutate } = useSWRConfig();
	const [loading, setLoading] = useState(false);
	const {
		data: blockedUsers,
		error,
		isLoading,
	} = useSWR<BlockedUser[]>("/user/blocked/all", fetcherPrivate);

	if (isLoading) {
		return (
			<Center>
				<Loader type="dots" />
			</Center>
		);
	}

	if (error || !blockedUsers) {
		return <></>;
	}

	const unblockUser = async (userLogin: string) => {
		if (window.confirm("Are you sure you want to unblock this user?")) {
			setLoading(true);
			try {
				await axiosPrivate.post("/user/unblock", {
					userLogin: userLogin,
				});
				await mutate(
					"/user/blocked/all",
					...blockedUsers.filter((user) => user.login !== userLogin),
				);
				mutate(
					(key: string) => key.startsWith("/channel/"),
					undefined,
					{ revalidate: true },
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
			<Box mt="md">
				<ScrollArea.Autosize mah={200} type="scroll">
					<Stack>
						{blockedUsers.map((blockedUser, index) => (
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
						))}
					</Stack>
				</ScrollArea.Autosize>
			</Box>
		</>
	);
};

export default BlockedUsers;
