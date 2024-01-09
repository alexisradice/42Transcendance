import { Center, Loader, Menu } from "@mantine/core";
import {
	IconBan,
	IconDeviceGamepad2,
	IconHammer,
	IconKarate,
	IconMessageCircle,
	IconMessageOff,
	IconSword,
} from "@tabler/icons-react";
import { ChannelMember, SocketResponse } from "../../types";
import UserCard from "../UserCard/UserCard";
import useSWR, { useSWRConfig } from "swr";
import { axiosPrivate, fetcherPrivate } from "../../utils/fetcher";
import { errorNotif } from "../../utils/errorNotif";
import { useSocket } from "../../hooks/useSocket";

type Props = {
	member: ChannelMember;
	memberRole: string;
	isOwner: boolean;
	isAdmin: boolean;
	isMe: boolean;
	channelId: string;
};

const ChannelMemberMenu = ({
	member,
	memberRole,
	isOwner,
	isAdmin,
	isMe,
	channelId,
}: Props) => {
	const { mutate } = useSWRConfig();
	const {
		data: blockedUsers,
		error,
		isLoading,
	} = useSWR<Array<{ login: string }>>("/user/blocked/all", fetcherPrivate);
	const chatSocket = useSocket("chat");

	const promoteToAdmin = async (member: ChannelMember) => {
		if (
			confirm(
				`Grant ${member.login} administrator privileges in this channel?`,
			)
		) {
			try {
				await axiosPrivate.post("/channel/admin/promote", {
					channelId,
					promoteeId: member.id,
				});
				mutate(`/channel/${channelId}`);
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

	const ejectMember = async (
		memberId: string,
		channelId: string,
		action: "kick" | "ban",
	) => {
		if (confirm(`Are you sure you want to ${action} ${member.login}?`)) {
			chatSocket.emit(
				"eject-member",
				{ kickedId: memberId, channelId, action },
				(response: SocketResponse) => {
					console.log("response", response);
					if (response.success) {
						mutate(`/channel/${channelId}`);
					} else {
						errorNotif(response.error);
					}
				},
			);
		}
	};

	if (isLoading) {
		return (
			<Center>
				<Loader type="dots" />
			</Center>
		);
	}

	if (error || !blockedUsers) {
		return <></>;
	}

	return (
		<>
			{isMe ? (
				<UserCard user={member} />
			) : (
				<Menu>
					<Menu.Target>
						<UserCard user={member} />
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Item
							leftSection={<IconMessageCircle size={18} />}
							onClick={() => {
								// openChat(member.login);
							}}
						>
							Messages
						</Menu.Item>
						<Menu.Item
							leftSection={<IconDeviceGamepad2 size={18} />}
						>
							Invite to play
						</Menu.Item>
						{blockedUsers.find((user) => {
							return user.login === member.login;
						}) ? (
							<Menu.Item
								color="green"
								leftSection={<IconBan size={18} />}
								onClick={() => {
									unblockMember(member);
								}}
							>
								Unblock
							</Menu.Item>
						) : (
							<Menu.Item
								color="red"
								leftSection={<IconBan size={18} />}
								onClick={() => {
									blockMember(member);
								}}
							>
								Block
							</Menu.Item>
						)}

						{isOwner && memberRole === "member" && (
							<>
								<Menu.Divider />
								<Menu.Item
									leftSection={<IconSword size={18} />}
									color="green"
									onClick={() => {
										if (promoteToAdmin) {
											promoteToAdmin(member);
										}
									}}
								>
									Promote to admin
								</Menu.Item>
							</>
						)}
						{(isOwner || (isAdmin && memberRole === "member")) && (
							<>
								<Menu.Divider />
								<Menu.Item
									color="yellow"
									leftSection={<IconMessageOff size={18} />}
								>
									Mute (5mn)
								</Menu.Item>
								<Menu.Item
									color="red"
									leftSection={<IconKarate size={18} />}
									onClick={() =>
										ejectMember(
											member.id,
											channelId,
											"kick",
										)
									}
								>
									Kick
								</Menu.Item>
								<Menu.Item
									color="red"
									leftSection={<IconHammer size={18} />}
									onClick={() =>
										ejectMember(member.id, channelId, "ban")
									}
								>
									Ban
								</Menu.Item>
							</>
						)}
					</Menu.Dropdown>
				</Menu>
			)}
		</>
	);
};

export default ChannelMemberMenu;
