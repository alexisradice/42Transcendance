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
import {
	IconMessages,
	IconSend2,
	IconSettings,
	IconUser,
} from "@tabler/icons-react";
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
					errorNotif(response.error);
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

	const promoteToAdmin = async (member: ChannelMember) => {
		if (
			confirm(
				`Grant ${member.login} administrator privileges in this channel?`,
			)
		) {
			try {
				await axiosPrivate.post("/channel/admin/promote", {
					channelId: data.channel.id,
					promoteeId: member.id,
				});
				mutate(`/channel/${channelId}`, {
					...data,
					admins: [...data.admins, member],
					members: data.members.filter(
						(member: ChannelMember) =>
							member.login !== member.login,
					),
				});
			} catch (err) {
				errorNotif(err);
			}
		}
	};

	const blockMember = async (member: ChannelMember) => {
		if (
			confirm(
				`Are you sure you want to block ${member.login}? This will also remove them from your friends list.`,
			)
		) {
			try {
				await axiosPrivate.post("user/block", {
					userLogin: member.login,
				});
				mutate(`/channel/${channelId}`);
				mutate("/user/friends/all");
				mutate("/user/blocked/all");
			} catch (err: unknown) {
				errorNotif(err);
			}
		}
	};

	const unblockMember = async (member: ChannelMember) => {
		if (confirm(`Are you sure you want to unblock ${member.login}?`)) {
			try {
				await axiosPrivate.post("user/unblock", {
					userLogin: member.login,
				});
				mutate(`/channel/${channelId}`);
				mutate("/user/friends/all");
				mutate("/user/blocked/all");
			} catch (err: unknown) {
				errorNotif(err);
			}
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
					<IconSettings />
				</UnstyledButton>
			</Group>
			{chatMode ? (
				<>
					<MessagesArea messages={data.messages} />
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
						blockMember={blockMember}
						unblockMember={unblockMember}
					/>
					{data.admins.length > 0 && (
						<>
							<Text size="xs" c="dimmed">
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
											blockMember={blockMember}
											unblockMember={unblockMember}
										/>
									);
								},
							)}
						</>
					)}
					{data.members.length > 0 && (
						<>
							<Text size="xs" c="dimmed">
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
											promoteToAdmin={promoteToAdmin}
											blockMember={blockMember}
											unblockMember={unblockMember}
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
