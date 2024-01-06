import { Center, Group, Loader, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconSend2 } from "@tabler/icons-react";
import { Socket } from "socket.io-client";
import useSWR from "swr";
import { Visibility } from "../../constants";
import { SocketResponse } from "../../types";
import { errorNotif } from "../../utils/errorNotif";
import { fetcherPrivate } from "../../utils/fetcher";
import { IconHash, IconHashLock } from "../Icons";
import MessagesArea from "../MessagesArea/MessagesArea";
import classes from "./ChatArea.module.css";

type Props = {
	channelId: string;
	chatSocket: Socket;
};

const ChatArea = ({ channelId, chatSocket }: Props) => {
	const {
		data: channel,
		error,
		isLoading,
		mutate,
	} = useSWR(`/channel/${channelId}`, fetcherPrivate);

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
				channelId: channel.id,
			},
			(response: SocketResponse) => {
				form.reset();
				if (!response.success) {
					errorNotif(response.error);
				} else {
					mutate({
						...channel,
						messages: [...channel.messages, response.payload],
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
						{channel.visibility === Visibility.PROTECTED ? (
							<IconHashLock size={28} />
						) : (
							<IconHash size={28} />
						)}
						<Text className={classes.title} lineClamp={1}>
							{channel.name}
						</Text>
						{/*TODO admin settings <IconSettings /> */}
					</Group>
					<MessagesArea messages={channel.messages} />
					<form onSubmit={form.onSubmit(sendMessage)}>
						<TextInput
							mt="sm"
							radius="lg"
							placeholder={`Message #${channel.name}`}
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
				</div>
			)}
		</>
	);
};

export default ChatArea;
