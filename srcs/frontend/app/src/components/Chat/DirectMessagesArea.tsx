import { Group, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconSend2 } from "@tabler/icons-react";
import { Socket } from "socket.io-client";
import { useSWRConfig } from "swr";
import { PROTECTED } from "../../constants";
import { ChannelInfos, Message, SocketResponse } from "../../types";
import { errorNotif } from "../../utils/errorNotif";
import { IconHash, IconHashLock } from "../Icons";
import MessagesArea from "../MessagesArea/MessagesArea";
import classes from "./Chat.module.css";

type Props = {
	channelData: ChannelInfos;
	chatSocket: Socket;
	login: string;
};

const DirectMessagesArea = ({ channelData, chatSocket, login }: Props) => {
	const { mutate } = useSWRConfig();
	const { channel, messages } = channelData;
	const channelId = channel.id;

	const form = useForm({
		initialValues: {
			content: "",
		},
		validate: {
			content: (value: string) => {
				if (value.length > 500) {
					return "Message must be at most 500 characters.";
				}
				return null;
			},
		},
	});

	const sendMessage = () => {
		const content = form.values.content;
		chatSocket.emit(
			"send-message",
			{
				content,
				channelId,
			},
			(response: SocketResponse<Message>) => {
				form.reset();
				if (response.error) {
					const err = new Error();
					Object.assign(err, response.error);
					errorNotif(err);
					mutate(`/channel/${channelId}`);
				} else if (response.data) {
					const newMessage = response.data;
					mutate(`/channel/${channelId}`, {
						...channelData,
						messages: [...messages, newMessage],
					});
				} else {
					console.warn("No message received from send-message");
				}
			},
		);
	};

	return (
		<div className={classes.chatArea}>
			<Group className={classes.titleGroup}>
				{channel.visibility === PROTECTED ? (
					<IconHashLock size={28} />
				) : (
					<IconHash size={28} />
				)}
				<Text className={classes.title} lineClamp={1}>
					{channel.name}
				</Text>
			</Group>
			<MessagesArea messages={messages} isDM={true} login={login} />
			<form onSubmit={form.onSubmit(sendMessage)}>
				<TextInput
					autoComplete="off"
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
	);
};

export default DirectMessagesArea;
