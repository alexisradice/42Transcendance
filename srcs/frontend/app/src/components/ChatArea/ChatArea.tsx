import { Center, Loader, TextInput, Title, Tooltip } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconSend2 } from "@tabler/icons-react";
import useSWR from "swr";
import { Channel, SocketResponse } from "../../types";
import { errorNotif } from "../../utils/errorNotif";
import { fetcherPrivate } from "../../utils/fetcher";
import MessagesArea from "../MessagesArea/MessagesArea";
import classes from "./ChatArea.module.css";
import { Socket } from "socket.io-client";

type Props = {
	selectedChannel: Channel;
	chatSocket: Socket | null;
};

const ChatArea = ({ selectedChannel, chatSocket }: Props) => {
	const {
		data: messages,
		error,
		isLoading,
		mutate,
	} = useSWR(`/channel/${selectedChannel.id}/messages`, fetcherPrivate);

	const form = useForm({
		initialValues: {
			content: "",
		},
	});

	const sendMessage = () => {
		const content = form.values.content;
		chatSocket?.emit(
			"send-message",
			{
				content,
				channelId: selectedChannel.id,
			},
			(response: SocketResponse) => {
				form.reset();
				if (!response.success) {
					errorNotif(response.error);
				} else {
					mutate([...messages, response.payload]);
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
					<Tooltip label={selectedChannel.name}>
						<Title className={classes.title} lineClamp={1}>
							{selectedChannel.name}
						</Title>
					</Tooltip>
					<MessagesArea messages={messages} />
					<form onSubmit={form.onSubmit(sendMessage)}>
						<TextInput
							mt="sm"
							radius="lg"
							placeholder={`Message #${selectedChannel.name}`}
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
