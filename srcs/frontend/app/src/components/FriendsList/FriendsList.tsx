import {
	Box,
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
import useSWR from "swr";
import { Friend } from "../../types";
import { errorNotif } from "../../utils/errorNotif";
import { axiosPrivate, fetcherPrivate } from "../../utils/fetcher";
import FriendCard from "../FriendCard/FriendCard";
import classes from "./FriendsList.module.css";

type Props = {
	height: number;
};

const FriendsList = ({ height }: Props) => {
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

	const submitHandler = async (values: { friendLogin: string }) => {
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
					<Modal
						opened={addFriendOpened}
						onClose={closeModal}
						title="Add new friend"
						centered
					>
						<form onSubmit={form.onSubmit(submitHandler)}>
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
							<Box hiddenFrom="lg">
								<IconPlus size={16} />
							</Box>
							<Text visibleFrom="lg">Add a new friend</Text>
						</Button>
					</Center>
					{friends.length > 0 && (
						<ScrollArea h={height - 36} type="scroll">
							<ul className={classes.list}>
								{friends.map(
									(friend: Friend, index: number) => {
										return (
											<li key={index}>
												<FriendCard
													friend={friend}
													removeFriend={removeFriend}
													blockFriend={blockFriend}
												/>
											</li>
										);
									},
								)}
								{/* <li>
									<FriendCard
										friend={{
											displayName: "test",
											login: "test",
											image: "test",
											status: "ONLINE",
										}}
										removeFriend={removeFriend}
									/>
								</li> */}
							</ul>
						</ScrollArea>
					)}
					{friends.length === 0 && (
						<>
							<Center
								className={classes.maxHeight}
								visibleFrom="lg"
							>
								<Text fs="italic">
									It's a bit empty around here.
								</Text>
							</Center>
						</>
					)}
				</>
			)}
		</>
	);
};

export default FriendsList;
