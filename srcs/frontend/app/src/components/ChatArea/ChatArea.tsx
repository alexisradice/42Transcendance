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
import { Socket } from "socket.io-client";
import useSWR from "swr";
import { Visibility } from "../../constants";
import { ChannelMember, SocketResponse, User } from "../../types";
import { errorNotif } from "../../utils/errorNotif";
import { axiosPrivate, fetcherPrivate } from "../../utils/fetcher";
import { IconHash, IconHashLock } from "../Icons";
import MessagesArea from "../MessagesArea/MessagesArea";
import classes from "./ChatArea.module.css";
import ChannelMemberMenu from "./ChannelMemberMenu";
import { useEffect } from "react";

type Props = {
	channelId: string;
	chatSocket: Socket;
	user: User;
};

const ChatArea = ({ user, channelId, chatSocket }: Props) => {
	const [chatMode, { toggle, open }] = useDisclosure(true);
	const { data, error, isLoading, mutate } = useSWR(
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
				const response = await axiosPrivate.post(
					"/channel/admin/promote",
					{
						channelId: data.channel.id,
						promoteeId: member.id,
					},
				);
				if (response.data.success) {
					mutate({
						...data,
						admins: [...data.admins, member],
						members: data.members.filter(
							(member: ChannelMember) =>
								member.login !== member.login,
						),
					});
				}
			} catch (err) {
				errorNotif(err);
			}
		}
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
							/>
							{data.admins.length > 0 && (
								<>
									<Text size="xs" c="dimmed">
										ADMINS ― {data.admins.length}
									</Text>
									{data.admins.map(
										(
											admin: ChannelMember,
											index: number,
										) => {
											return (
												<ChannelMemberMenu
													key={index}
													member={admin}
													memberRole="admin"
													isOwner={
														user.login ===
														data.owner.login
													}
													isAdmin={isAdmin()}
													isMe={
														user.login ===
														admin.login
													}
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
										(
											member: ChannelMember,
											index: number,
										) => {
											return (
												<ChannelMemberMenu
													key={index}
													member={member}
													memberRole="member"
													isOwner={
														user.login ===
														data.owner.login
													}
													isAdmin={isAdmin()}
													isMe={
														user.login ===
														member.login
													}
													promoteToAdmin={
														promoteToAdmin
													}
												/>
											);
										},
									)}
								</>
							)}
						</AppShell.Section>
					)}
				</div>
			)}
		</>
	);
};

export default ChatArea;
