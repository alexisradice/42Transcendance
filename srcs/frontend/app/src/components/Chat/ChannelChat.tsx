import {
	AppShell,
	Group,
	ScrollArea,
	Text,
	TextInput,
	UnstyledButton,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconMessages, IconSend2, IconUser } from "@tabler/icons-react";
import { useEffect } from "react";
import { Socket } from "socket.io-client";
import { useSWRConfig } from "swr";
import { PROTECTED } from "../../constants";
import { ChannelInfos, Message, SocketResponse } from "../../types";
import { errorNotif } from "../../utils/errorNotif";
import { axiosPrivate } from "../../utils/fetcher";
import ChannelMenu from "../ChannelMenu/ChannelMenu";
import { IconHash, IconHashLock } from "../Icons";
import MessagesArea from "../MessagesArea/MessagesArea";
import ChannelMemberMenu from "./ChannelMemberMenu";
import classes from "./Chat.module.css";

type Props = {
	channel: ChannelInfos;
	chatSocket: Socket;
	login: string;
	leaveChannel: (channelId: string) => void;
	joinDM: (friendLogin: string) => void;
};

const ChannelChat = ({
	channel,
	chatSocket,
	login,
	leaveChannel,
	joinDM,
}: Props) => {
	const { mutate } = useSWRConfig();
	const [chatMode, { toggle, open }] = useDisclosure(true);
	const { owner, admins, members, messages, muted } = channel;
	const channelId = channel.id;

	useEffect(() => {
		open();
	}, [open, channel.id]);

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
						...channel,
						messages: [...messages, newMessage],
					});
				} else {
					console.warn("No message received from send-message");
				}
			},
		);
	};

	const isAdmin = () => {
		for (const admin of admins) {
			if (admin.login === login) {
				return true;
			}
		}
		return false;
	};

	const isMuted = (memberLogin: string) => {
		for (const mutedLogin of muted) {
			if (mutedLogin === memberLogin) {
				return true;
			}
		}
		return false;
	};

	const removePassword = async () => {
		if (confirm("This channel will be publicly open. Are you sure?")) {
			try {
				await axiosPrivate.post("/channel/password/remove", {
					channelId,
				});
				mutate(`/channel/${channelId}`);
				mutate("/channel/list");
			} catch (err) {
				errorNotif(err);
			}
		}
	};

	const addPassword = async (password: string) => {
		try {
			await axiosPrivate.post("/channel/password/add", {
				channelId,
				password,
			});
			mutate(`/channel/${channelId}`);
			mutate("/channel/list");
		} catch (err) {
			errorNotif(err);
		}
	};

	const changePassword = async (password: string) => {
		try {
			await axiosPrivate.post("/channel/password/change", {
				channelId,
				newPassword: password,
			});
			mutate(`/channel/${channelId}`);
			mutate("/channel/list");
		} catch (err) {
			errorNotif(err);
		}
	};

	const leaveChatRoom = () => {
		chatSocket.emit(
			"leave-chatroom",
			{ channelId },
			(response: SocketResponse<unknown>) => {
				if (response.error) {
					const err = new Error();
					Object.assign(err, response.error);
					errorNotif(err);
				} else {
					leaveChannel(channelId);
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
				<UnstyledButton variant="unstyled" onClick={toggle}>
					{chatMode ? <IconUser /> : <IconMessages />}
				</UnstyledButton>
				<UnstyledButton variant="unstyled">
					<ChannelMenu
						isOwner={owner.login === login}
						hasPassword={channel.visibility === PROTECTED}
						addPassword={addPassword}
						changePassword={changePassword}
						removePassword={removePassword}
						leaveChatRoom={leaveChatRoom}
					/>
				</UnstyledButton>
			</Group>
			{chatMode ? (
				<>
					<MessagesArea messages={messages} isDM={false} />
					<form onSubmit={form.onSubmit(sendMessage)}>
						<TextInput
							autoComplete="off"
							disabled={isMuted(login)}
							mt="sm"
							radius="lg"
							placeholder={
								isMuted(login)
									? "You are muted in this channel."
									: `Message #${channel.name}`
							}
							rightSection={
								isMuted(login) ? (
									<></>
								) : (
									<IconSend2
										className={classes.sendButton}
										onClick={sendMessage}
									/>
								)
							}
							rightSectionPointerEvents="all"
							{...form.getInputProps("content")}
						/>
					</form>
				</>
			) : (
				<AppShell.Section grow mt="md" component={ScrollArea}>
					<Text size="xs" c="dimmed">
						OWNER
					</Text>
					<ChannelMemberMenu
						member={owner}
						memberRole="owner"
						isOwner={login === owner.login}
						isAdmin={isAdmin()}
						isMe={login === owner.login}
						channelId={channelId}
						joinDM={joinDM}
					/>
					{admins.length > 0 && (
						<>
							<Text size="xs" c="dimmed" mt="md">
								ADMINS ― {admins.length}
							</Text>
							{admins.map((admin, index) => {
								return (
									<ChannelMemberMenu
										key={index}
										member={admin}
										memberRole="admin"
										isOwner={login === owner.login}
										isAdmin={isAdmin()}
										isMe={login === admin.login}
										channelId={channelId}
										isMuted={isMuted(admin.login)}
										joinDM={joinDM}
									/>
								);
							})}
						</>
					)}
					{members.length > 0 && (
						<>
							<Text size="xs" c="dimmed" mt="md">
								MEMBERS ― {members.length}
							</Text>
							{members.map((member, index) => {
								return (
									<ChannelMemberMenu
										key={index}
										member={member}
										memberRole="member"
										isOwner={login === owner.login}
										isAdmin={isAdmin()}
										isMe={login === member.login}
										channelId={channelId}
										isMuted={isMuted(member.login)}
										joinDM={joinDM}
									/>
								);
							})}
						</>
					)}
				</AppShell.Section>
			)}
		</div>
	);
};

export default ChannelChat;
