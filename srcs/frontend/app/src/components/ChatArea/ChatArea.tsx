import { TextInput, Title, Tooltip } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconSend2 } from "@tabler/icons-react";
import { useEffect } from "react";
import { Socket } from "socket.io-client";
import useSWR from "swr";
import { Channel, Message } from "../../types";
import { fetcherPrivate } from "../../utils/fetcher";
import MessagesArea from "../MessagesArea/MessagesArea";
import classes from "./ChatArea.module.css";

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

	useEffect(() => {
		chatSocket?.on("display-message", (message: Message) => {
			console.log("message", message);
			mutate([...messages]);
		});

		return () => {
			chatSocket?.off("display-message");
		};
	}, [chatSocket, mutate, messages]);

	const form = useForm({
		initialValues: {
			content: "",
		},
	});

	const sendMessage = () => {
		const content = form.values.content;
		chatSocket?.emit("send-message", {
			content,
			channelId: selectedChannel.id,
		});
	};

	return (
		<>
			{!error && isLoading && <div>Loading...</div>}
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
									onClick={() => form.onSubmit(sendMessage)}
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
