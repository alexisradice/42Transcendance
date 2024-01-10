import {
	AppShell,
	Center,
	Group,
	Loader,
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
import useSWR, { useSWRConfig } from "swr";
import { Visibility } from "../../constants";
import {
	ChannelInfos,
	ChannelMember,
	Message,
	SocketResponse,
	User,
} from "../../types";
import { errorNotif } from "../../utils/errorNotif";
import { axiosPrivate, fetcherPrivate } from "../../utils/fetcher";
import ChannelMenu from "../ChannelMenu/ChannelMenu";
import { IconHash, IconHashLock } from "../Icons";
import MessagesArea from "../MessagesArea/MessagesArea";
import ChannelMemberMenu from "./ChannelMemberMenu";
import classes from "./ChatArea.module.css";

type Props = {
	channelId: string;
	chatSocket: Socket;
	user: User;
};

const ChatArea = ({ user, channelId, chatSocket }: Props) => {
	const { mutate } = useSWRConfig();
	const [chatMode, { toggle, open }] = useDisclosure(true);
	const { data, error, isLoading } = useSWR<ChannelInfos>(
		`/channel/${channelId}`,
		fetcherPrivate,
	);

	useEffect(() => {
		open();
	}, [open, channelId]);

	const form = useForm({
		initialValues: {
			content: "",
		},
	});

	if (isLoading) {
		return (
			<Center className="h-100">
				<Loader type="dots" />
			</Center>
		);
	}

	if (error || !data) {
		return <></>;
	}

	const sendMessage = () => {
		const content = form.values.content;
		chatSocket.emit(
			"send-message",
			{
				content,
				channelId,
			},
			(response: SocketResponse) => {
				const newMessage = response.payload as Message;
				form.reset();
				if (!response.success || response.error) {
					const err = new Error();
					Object.assign(err, response.error);
					errorNotif(err);
					mutate(`/channel/${channelId}`);
				} else {
					mutate(`/channel/${channelId}`, {
						...data,
						messages: [...data.messages, newMessage],
					});
				}
			},
		);
	};

	const isAdmin = () => {
		for (const admin of data.admins) {
			if (admin.login === user.login) {
				return true;
			}
		}
		return false;
	};

	const isMuted = (memberLogin: string) => {
		for (const mutedLogin of data.muted) {
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

	return (
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
					<ChannelMenu
						isOwner={data.owner.login === user.login}
						hasPassword={
							data.channel.visibility === Visibility.PROTECTED
						}
						addPassword={addPassword}
						removePassword={removePassword}
					/>
				</UnstyledButton>
			</Group>
			{chatMode ? (
				<>
					<MessagesArea
						messages={data.messages}
						userLogin={user.login}
					/>
					<form onSubmit={form.onSubmit(sendMessage)}>
						<TextInput
							disabled={isMuted(user.login)}
							mt="sm"
							radius="lg"
							placeholder={
								isMuted(user.login)
									? "You are muted in this channel."
									: `Message #${data.channel.name}`
							}
							rightSection={
								isMuted(user.login) ? (
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
						member={data.owner as ChannelMember}
						memberRole="owner"
						isOwner={user.login === data.owner.login}
						isAdmin={isAdmin()}
						isMe={user.login === data.owner.login}
						channelId={channelId}
					/>
					{data.admins.length > 0 && (
						<>
							<Text size="xs" c="dimmed" mt="md">
								ADMINS ― {data.admins.length}
							</Text>
							{data.admins.map(
								(admin: ChannelMember, index: number) => {
									return (
										<ChannelMemberMenu
											key={index}
											member={admin}
											memberRole="admin"
											isOwner={
												user.login === data.owner.login
											}
											isAdmin={isAdmin()}
											isMe={user.login === admin.login}
											channelId={channelId}
											isMuted={isMuted(admin.login)}
										/>
									);
								},
							)}
						</>
					)}
					{data.members.length > 0 && (
						<>
							<Text size="xs" c="dimmed" mt="md">
								MEMBERS ― {data.members.length}
							</Text>
							{data.members.map(
								(member: ChannelMember, index: number) => {
									return (
										<ChannelMemberMenu
											key={index}
											member={member}
											memberRole="member"
											isOwner={
												user.login === data.owner.login
											}
											isAdmin={isAdmin()}
											isMe={user.login === member.login}
											channelId={channelId}
											isMuted={isMuted(member.login)}
										/>
									);
								},
							)}
						</>
					)}
				</AppShell.Section>
			)}
		</div>
	);
};

export default ChatArea;
