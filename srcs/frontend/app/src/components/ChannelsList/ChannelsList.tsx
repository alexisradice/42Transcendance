import {
	Button,
	Center,
	Group,
	Loader,
	Modal,
	PasswordInput,
	ScrollArea,
	Select,
	Text,
	TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconLock, IconPlus } from "@tabler/icons-react";
import { Dispatch, SetStateAction, useState } from "react";
import useSWR from "swr";
import { Channel } from "../../types";
import { errorNotif } from "../../utils/errorNotif";
import { axiosPrivate, fetcherPrivate } from "../../utils/fetcher";
import classes from "./ChannelsList.module.css";

type Props = {
	height: number;
	joinChannel: (channel: Channel) => void;
	setChatOpened: Dispatch<SetStateAction<boolean>>;
};

const ChannelsList = ({ height, joinChannel, setChatOpened }: Props) => {
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [createChannelOpened, { open, close }] = useDisclosure(false);
	const [createChannelLoading, setCreateChannelLoading] =
		useState<boolean>(false);
	const { data, error, isLoading, mutate } = useSWR(
		"/channel/list",
		fetcherPrivate,
	);

	const form = useForm({
		initialValues: {
			channelName: "",
			visibility: "PUBLIC",
			password: "",
		},
		validate: {
			channelName: (value: string) => {
				if (/^(?=.{3,100}$)[a-z]+([a-z0-9]|-)*[a-z]+$/.test(value)) {
					return null;
				}
				return "Invalid channel name";
			},
			visibility: (value: string) => {
				if (["PUBLIC", "PROTECTED", "PRIVATE"].includes(value)) {
					return null;
				}
				return "Invalid visibility";
			},
			password: (value: string) => {
				console.log("form.values.visibility", form.values.visibility);
				if (
					form.values.visibility !== "PROTECTED" ||
					value.length >= 8
				) {
					return null;
				}
				return "Password must be at least 8 characters long";
			},
		},
	});

	const closeModal = () => {
		close();
		setCreateChannelLoading(false);
		setShowPassword(false);
		form.reset();
	};

	const createChannel = async () => {
		console.log("form.values", form.values);
		setCreateChannelLoading(true);
		try {
			await axiosPrivate.post("/channel/create", form.values);
			mutate([...data]);
			closeModal();
		} catch (err) {
			errorNotif(err);
		}
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
						opened={createChannelOpened}
						onClose={closeModal}
						title="Create new channel"
						centered
					>
						<form onSubmit={form.onSubmit(createChannel)}>
							<TextInput
								label="Name"
								placeholder="my-awesome-channel"
								{...form.getInputProps("channelName")}
								// onKeyUp={() => {
								// 	form.setValues((prev) => ({
								// 		...prev,
								// 		channelName: prev.channelName
								// 			?.replace(" ", "-")
								// 			.replace("_", "-")
								// 			.replace("--", "-")
								// 			.toLowerCase(),
								// 	}));
								// }}
								disabled={createChannelLoading}
							/>
							<Select
								allowDeselect={false}
								label="Visibility"
								mt="md"
								data={[
									{ value: "PUBLIC", label: "Public" },
									{
										value: "PRIVATE",
										label: "Private",
									},
									{ value: "PROTECTED", label: "Protected" },
								]}
								onChange={(value) => {
									if (value === "PROTECTED") {
										setShowPassword(true);
									} else {
										setShowPassword(false);
									}
									form.setFieldValue(
										"visibility",
										value || "PUBLIC",
									);
								}}
								defaultValue="PUBLIC"
							/>
							{showPassword && (
								<PasswordInput
									mt="md"
									label="Password"
									placeholder="Channel password"
									{...form.getInputProps("password")}
									disabled={createChannelLoading}
								/>
							)}
							<Group justify="flex-end">
								<Button
									type="submit"
									color="blue"
									mt="lg"
									disabled={createChannelLoading}
									rightSection={
										createChannelLoading ? (
											<Loader type="dots" />
										) : null
									}
								>
									Create channel
								</Button>
							</Group>
						</form>
					</Modal>
					<ScrollArea h={height} type="scroll" scrollbars="y">
						<Button onClick={open} variant="subtle" fullWidth>
							<IconPlus size={16} />
							<Text visibleFrom="lg">&nbsp;Create channel</Text>
						</Button>
						<ul className={classes.list}>
							{data.map((channel: Channel) => (
								<li
									key={channel.id}
									className={classes.item}
									onClick={() => {
										joinChannel(channel);
										setChatOpened(true);
									}}
								>
									<Group align="center" gap={5}>
										<Text size="xl">#</Text>
										<Text>{channel.name}</Text>
										{channel.visibility === "PROTECTED" && (
											<IconLock size={18} />
										)}
									</Group>
								</li>
							))}
						</ul>
					</ScrollArea>
				</>
			)}
		</>
	);
};

export default ChannelsList;
