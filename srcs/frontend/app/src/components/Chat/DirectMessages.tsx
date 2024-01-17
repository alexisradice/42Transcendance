import { Group, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconSend2 } from "@tabler/icons-react";
import { useMemo } from "react";
import { Socket } from "socket.io-client";
import { useSWRConfig } from "swr";
import { ChannelInfos, Message, SocketResponse } from "../../types";
import { errorNotif } from "../../utils/errorNotif";
import MessagesArea from "../MessagesArea/MessagesArea";
import classes from "./Chat.module.css";

type Props = {
	channel: ChannelInfos;
	chatSocket: Socket;
	login: string;
};

const DirectMessages = ({ channel, chatSocket, login }: Props) => {
	const { mutate } = useSWRConfig();
	const { messages } = channel;
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

	const dest = useMemo(() => {
		const { members } = channel;
		console.log("members", members);
		const dest = members.find((member) => member.login !== login)!;
		return dest;
	}, [channel, login]);

	const sendMessage = () => {
		const content = form.values.content;
		chatSocket.emit(
			"send-dm",
			{
				destId: dest.id,
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
						...channel,
						messages: [...messages, newMessage],
					});
				} else {
					console.warn("No message received from send-dm");
				}
			},
		);
	};

	return (
		<div className={classes.chatArea}>
			<Group className={classes.titleGroup}>
				<Text className={classes.title} lineClamp={1}>
					{dest.displayName}{" "}
					<span className={classes.login}>@{dest.login}</span>
				</Text>
			</Group>
			<MessagesArea messages={messages} isDM={true} login={login} />
			<form onSubmit={form.onSubmit(sendMessage)}>
				<TextInput
					autoComplete="off"
					mt="sm"
					radius="lg"
					placeholder={`Message @${dest.login}`}
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

export default DirectMessages;
