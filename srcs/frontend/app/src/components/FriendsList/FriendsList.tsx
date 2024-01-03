import {
	AppShell,
	Button,
	Center,
	Loader,
	Modal,
	ScrollArea,
	Text,
	TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { AxiosError } from "axios";
import { useState } from "react";
import { Socket } from "socket.io-client";
import useSWR from "swr";
import { Friend } from "../../types";
import { errorNotif } from "../../utils/errorNotif";
import { axiosPrivate, fetcherPrivate } from "../../utils/fetcher";
import FriendCard from "../FriendCard/FriendCard";
import classes from "./FriendsList.module.css";

type Props = {
	chatSocket: Socket | null;
};

const FriendsList = ({ chatSocket }: Props) => {
	const [addFriendOpened, { open, close }] = useDisclosure(false);
	const [addFriendLoading, setAddFriendLoading] = useState<boolean>(false);
	const [addFriendError, setAddFriendError] = useState<string | undefined>(
		undefined,
	);
	const {
		data: friends,
		error,
		isLoading,
		mutate,
	} = useSWR("/user/friends/all", fetcherPrivate);

	const form = useForm({
		initialValues: {
			friendLogin: "",
		},
		validate: {
			friendLogin: (value: string) => {
				if (/^([a-z]|-)+$/.test(value)) {
					return null;
				}
				return "Logins are 3-20 characters long";
			},
		},
	});

	const addFriend = async (values: { friendLogin: string }) => {
		setAddFriendLoading(true);
		try {
			await axiosPrivate.post("user/friends/add", {
				friendLogin: values.friendLogin,
			});
			setAddFriendLoading(false);
			setAddFriendError(undefined);
			close();
			mutate({ ...friends });
			form.reset();
		} catch (err: unknown) {
			setAddFriendLoading(false);
			if (err instanceof AxiosError && err.response?.status === 400) {
				setAddFriendError(err.response?.data.message);
			} else {
				errorNotif(err);
			}
		}
	};

	const removeFriend = async (friendLogin: string) => {
		try {
			await axiosPrivate.post("user/friends/remove", {
				friendLogin,
			});
			mutate({ ...friends });
		} catch (err: unknown) {
			errorNotif(err);
		}
	};

	const blockFriend = async (friendLogin: string) => {
		try {
			await axiosPrivate.post("user/block", {
				userLogin: friendLogin,
			});
			mutate({ ...friends });
		} catch (err: unknown) {
			errorNotif(err);
		}
	};

	const closeModal = () => {
		close();
		form.reset();
		setAddFriendError(undefined);
	};

	const openChat = (friendLogin: string) => {
		chatSocket?.emit("join", friendLogin);
	};

	return (
		<>
			{!error && isLoading && (
				<Center>
					<Loader type="dots" />
				</Center>
			)}
			{!error && !isLoading && (
				<>
					<Modal
						opened={addFriendOpened}
						onClose={closeModal}
						title="Add new friend"
						centered
					>
						<form onSubmit={form.onSubmit(addFriend)}>
							<TextInput
								placeholder="Type their login to find someone"
								{...form.getInputProps("friendLogin")}
								rightSection={
									addFriendLoading ? (
										<Loader type="dots" />
									) : null
								}
								error={addFriendError}
								disabled={addFriendLoading}
							/>
						</form>
					</Modal>
					<Center>
						<Button onClick={open} variant="subtle" fullWidth>
							<IconPlus size={16} />
							<Text>&nbsp;Add a new friend</Text>
						</Button>
					</Center>
					<AppShell.Section
						component={ScrollArea}
						type="scroll"
						className="h-100"
						style={{ flex: 1 }}
					>
						{friends.length > 0 && (
							<ul className={classes.list}>
								{friends.map(
									(friend: Friend, index: number) => {
										return (
											<li key={index}>
												<FriendCard
													openChat={openChat}
													friend={friend}
													removeFriend={removeFriend}
													blockFriend={blockFriend}
												/>
											</li>
										);
									},
								)}
								<li>
									<FriendCard
										openChat={openChat}
										friend={{
											login: "lmurtin",
											displayName: "lmurtin",
											image: "",
											status: "ONLINE",
										}}
										removeFriend={removeFriend}
										blockFriend={blockFriend}
									/>
								</li>
								<li>
									<FriendCard
										openChat={openChat}
										friend={{
											login: "lmurtin",
											displayName: "lmurtin",
											image: "",
											status: "ONLINE",
										}}
										removeFriend={removeFriend}
										blockFriend={blockFriend}
									/>
								</li>
								<li>
									<FriendCard
										openChat={openChat}
										friend={{
											login: "lmurtin",
											displayName: "lmurtin",
											image: "",
											status: "ONLINE",
										}}
										removeFriend={removeFriend}
										blockFriend={blockFriend}
									/>
								</li>
								<li>
									<FriendCard
										openChat={openChat}
										friend={{
											login: "lmurtin",
											displayName: "lmurtin",
											image: "",
											status: "ONLINE",
										}}
										removeFriend={removeFriend}
										blockFriend={blockFriend}
									/>
								</li>
								<li>
									<FriendCard
										openChat={openChat}
										friend={{
											login: "lmurtin",
											displayName: "lmurtin",
											image: "",
											status: "ONLINE",
										}}
										removeFriend={removeFriend}
										blockFriend={blockFriend}
									/>
								</li>
								<li>
									<FriendCard
										openChat={openChat}
										friend={{
											login: "lmurtin",
											displayName: "lmurtin",
											image: "",
											status: "ONLINE",
										}}
										removeFriend={removeFriend}
										blockFriend={blockFriend}
									/>
								</li>
								<li>
									<FriendCard
										openChat={openChat}
										friend={{
											login: "lmurtin",
											displayName: "lmurtin",
											image: "",
											status: "ONLINE",
										}}
										removeFriend={removeFriend}
										blockFriend={blockFriend}
									/>
								</li>
								<li>
									<FriendCard
										openChat={openChat}
										friend={{
											login: "lmurtin",
											displayName: "lmurtin",
											image: "",
											status: "ONLINE",
										}}
										removeFriend={removeFriend}
										blockFriend={blockFriend}
									/>
								</li>
								<li>
									<FriendCard
										openChat={openChat}
										friend={{
											login: "lmurtin",
											displayName: "lmurtin",
											image: "",
											status: "ONLINE",
										}}
										removeFriend={removeFriend}
										blockFriend={blockFriend}
									/>
								</li>
								<li>
									<FriendCard
										openChat={openChat}
										friend={{
											login: "lmurtin",
											displayName: "lmurtin",
											image: "",
											status: "ONLINE",
										}}
										removeFriend={removeFriend}
										blockFriend={blockFriend}
									/>
								</li>
								<li>
									<FriendCard
										openChat={openChat}
										friend={{
											login: "lmurtin",
											displayName: "lmurtin",
											image: "",
											status: "ONLINE",
										}}
										removeFriend={removeFriend}
										blockFriend={blockFriend}
									/>
								</li>
								<li>
									<FriendCard
										openChat={openChat}
										friend={{
											login: "lmurtin",
											displayName: "lmurtin",
											image: "",
											status: "ONLINE",
										}}
										removeFriend={removeFriend}
										blockFriend={blockFriend}
									/>
								</li>
							</ul>
						)}
						{friends.length === 0 && (
							<Center
								component={Text}
								className="h-100"
								fs="italic"
							>
								It's a bit empty around here.
							</Center>
						)}
					</AppShell.Section>
				</>
			)}
		</>
	);
};

export default FriendsList;
