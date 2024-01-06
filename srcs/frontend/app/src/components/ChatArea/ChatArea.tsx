import {
	Center,
	Group,
	Loader,
	Text,
	TextInput,
	UnstyledButton,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import {
	IconCrown,
	IconMessages,
	IconSend2,
	IconSettings,
	IconSword,
	IconUser,
} from "@tabler/icons-react";
import { Socket } from "socket.io-client";
import useSWR from "swr";
import { Visibility } from "../../constants";
import { ChannelMember, SocketResponse } from "../../types";
import { errorNotif } from "../../utils/errorNotif";
import { fetcherPrivate } from "../../utils/fetcher";
import { IconHash, IconHashLock } from "../Icons";
import MessagesArea from "../MessagesArea/MessagesArea";
import UserCard from "../UserCard/UserCard";
import classes from "./ChatArea.module.css";

type Props = {
	channelId: string;
	chatSocket: Socket;
};

const ChatArea = ({ channelId, chatSocket }: Props) => {
	const [chatMode, { toggle }] = useDisclosure(true);
	const { data, error, isLoading, mutate } = useSWR(
		`/channel/${channelId}`,
		fetcherPrivate,
	);

	const form = useForm({
		initialValues: {
			content: "",
		},
	});

	const sendMessage = () => {
		const content = form.values.content;
		chatSocket.emit(
			"send-message",
			{
				content,
				channelId: data.channel.id,
			},
			(response: SocketResponse) => {
				form.reset();
				if (!response.success) {
					errorNotif(response.error);
				} else {
					mutate({
						...data,
						channel: {
							...data.channel,
							messages: [
								...data.channel.messages,
								response.payload,
							],
						},
					});
				}
			},
		);
	};

	return (
		<>
			{!error && isLoading && (
				<Center className="h-100">
					<Loader type="dots" />
				</Center>
			)}
			{!error && !isLoading && (
				<div className={classes.chatArea}>
					<Group className={classes.titleGroup}>
						{data.channel.visibility === Visibility.PROTECTED ? (
							<IconHashLock size={28} />
						) : (
							<IconHash size={28} />
						)}
						<Text className={classes.title} lineClamp={1}>
							{data.channel.name}
						</Text>
						<UnstyledButton variant="unstyled" onClick={toggle}>
							{chatMode ? <IconUser /> : <IconMessages />}
						</UnstyledButton>
						<UnstyledButton variant="unstyled">
							<IconSettings />
						</UnstyledButton>
					</Group>
					{chatMode ? (
						<>
							<MessagesArea messages={data.channel.messages} />
							<form onSubmit={form.onSubmit(sendMessage)}>
								<TextInput
									mt="sm"
									radius="lg"
									placeholder={`Message #${data.channel.name}`}
									rightSection={
										<IconSend2
											className={classes.sendButton}
											onClick={sendMessage}
										/>
									}
									rightSectionPointerEvents="all"
									{...form.getInputProps("content")}
								/>
							</form>
						</>
					) : (
						<div className={classes.usersList}>
							<Text size="xs" c="dimmed">
								OWNER
							</Text>
							<UserCard
								user={data.owner}
								icon={<IconCrown size={18} />}
							/>
							{data.admins.length > 0 && (
								<>
									<Text size="xs" c="dimmed">
										ADMINS ― {data.admins.length}
									</Text>
									{data.admins.map((admin: ChannelMember) => {
										return (
											<UserCard
												user={admin}
												icon={<IconSword size={18} />}
											/>
										);
									})}
								</>
							)}
							{data.members.length > 0 && (
								<>
									<Text size="xs" c="dimmed">
										MEMBERS ― {data.members.length}
									</Text>
									{data.members.map(
										(member: ChannelMember) => {
											return <UserCard user={member} />;
										},
									)}
								</>
							)}
						</div>
					)}
				</div>
			)}
		</>
	);
};

export default ChatArea;
