import {
	Button,
	Center,
	Input,
	Loader,
	Modal,
	ScrollArea,
	Stack,
	Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
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
			close();
			mutate({ ...friends });
		} catch (err: unknown) {
			setAddFriendLoading(false);
			errorNotif(err);
		}
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
						onClose={close}
						title="Add new friend"
						centered
					>
						<form onSubmit={form.onSubmit(submitHandler)}>
							<Input
								placeholder="Type their login to find someone"
								{...form.getInputProps("friendLogin")}
								rightSection={
									addFriendLoading ? (
										<Loader type="dots" />
									) : null
								}
								disabled={addFriendLoading}
							/>
						</form>
					</Modal>
					{friends.length > 0 && (
						<ScrollArea h={height} type="scroll">
							<ul className={classes.list}>
								{friends.map(
									(friend: Friend, index: number) => {
										return (
											<li key={index}>
												<FriendCard friend={friend} />
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
									onClick={open}
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
