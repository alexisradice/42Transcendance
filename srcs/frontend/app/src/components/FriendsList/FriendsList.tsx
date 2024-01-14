import {
	AppShell,
	Button,
	Center,
	Group,
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
import useSWR, { useSWRConfig } from "swr";
import { GeneralUser } from "../../types";
import { errorNotif } from "../../utils/errorNotif";
import { axiosPrivate, fetcherPrivate } from "../../utils/fetcher";
import FriendCard from "../FriendCard/FriendCard";
import classes from "./FriendsList.module.css";

type Props = {
	joinDM: (friendLogin: string) => void;
};

const FriendsList = ({ joinDM }: Props) => {
	const { mutate } = useSWRConfig();
	const [addFriendOpened, { open, close }] = useDisclosure(false);
	const [loading, setLoading] = useState<boolean>(false);
	const {
		data: friends,
		error,
		isLoading,
	} = useSWR("/user/friends/all", fetcherPrivate);

	const form = useForm({
		initialValues: {
			friendLogin: "",
		},
		validate: {
			friendLogin: (value: string) => {
				if (/^(\w|-){1,10}$/.test(value)) {
					return null;
				}
				return "Logins are 1-10 characters long";
			},
		},
	});

	if (isLoading) {
		return (
			<Center>
				<Loader type="dots" />
			</Center>
		);
	}

	if (error || !friends) {
		return <></>;
	}

	const addFriend = async (values: { friendLogin: string }) => {
		setLoading(true);
		try {
			await axiosPrivate.post("user/friends/add", {
				login: values.friendLogin,
			});
			setLoading(false);
			closeModal();
			mutate("/user/friends/all");
		} catch (err: unknown) {
			setLoading(false);
			if (err instanceof AxiosError && err.response?.status === 400) {
				form.setFieldError("friendLogin", err.response?.data.message);
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
			mutate("/user/friends/all");
		} catch (err: unknown) {
			errorNotif(err);
		}
	};

	const blockFriend = async (friendLogin: string) => {
		try {
			await axiosPrivate.post("user/block", {
				userLogin: friendLogin,
			});
			mutate("/user/friends/all");
			mutate((key: string) => key.startsWith("/channel/"), undefined, {
				revalidate: true,
			});
		} catch (err: unknown) {
			errorNotif(err);
		}
	};

	const closeModal = () => {
		close();
		form.reset();
	};

	return (
		<>
			<Modal
				opened={addFriendOpened}
				onClose={closeModal}
				title="Add a new friend"
				centered
			>
				<form onSubmit={form.onSubmit(addFriend)}>
					<TextInput
						placeholder="Friend login"
						disabled={loading}
						data-autofocus
						{...form.getInputProps("friendLogin")}
					/>
					<Group justify="flex-end" align="center">
						<Button
							type="submit"
							color="blue"
							disabled={loading}
							mt="md"
						>
							{loading ? <Loader type="dots" /> : "Add"}
						</Button>
					</Group>
				</form>
			</Modal>
			<Center>
				<Button onClick={open} variant="subtle" fullWidth>
					<IconPlus size={16} />
					<Text>&nbsp;Add a new friend</Text>
				</Button>
			</Center>
			{friends.length > 0 && (
				<AppShell.Section
					component={ScrollArea}
					type="scroll"
					className="h-100 flex-1"
				>
					<ul className={classes.list}>
						{friends.map((friend: GeneralUser, index: number) => {
							return (
								<li key={index}>
									<FriendCard
										friend={friend}
										removeFriend={removeFriend}
										blockFriend={blockFriend}
										joinDM={joinDM}
									/>
								</li>
							);
						})}
					</ul>
				</AppShell.Section>
			)}
			{friends.length === 0 && (
				<AppShell.Section className="flex-1">
					<Center className="h-100">
						<Text fs="italic" c="dimmed" size="sm">
							*cricket noise*
						</Text>
					</Center>
				</AppShell.Section>
			)}
		</>
	);
};

export default FriendsList;
