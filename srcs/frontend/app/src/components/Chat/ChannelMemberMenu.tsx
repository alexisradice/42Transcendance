import { Center, Loader, Menu } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
	IconBan,
	IconDeviceGamepad2,
	IconHammer,
	IconKarate,
	IconMessage,
	IconMessageCircle,
	IconMessageOff,
	IconSword,
	IconUserScan,
	IconVolumeOff,
} from "@tabler/icons-react";
import { useAtom } from "jotai";
import useSWR, { useSWRConfig } from "swr";
import { gameSettingsAtom } from "../../context/atoms";
import { useSocketContext } from "../../context/useContextGameSocket";
import { useSocket } from "../../hooks/useSocket";
import { GeneralUser, MemberRole, SocketResponse } from "../../types";
import { errorNotif } from "../../utils/errorNotif";
import { axiosPrivate, fetcherPrivate } from "../../utils/fetcher";
import UserCard from "../UserCard/UserCard";
import { useDisclosure } from "@mantine/hooks";
import StatsModal from "../StatsModal/StatsModal";

type Props = {
	member: GeneralUser;
	memberRole: MemberRole;
	isOwner: boolean;
	isAdmin: boolean;
	isMe: boolean;
	channelId: string;
	isMuted?: boolean;
	joinDM: (friendLogin: string) => void;
};

const ChannelMemberMenu = ({
	member,
	memberRole,
	isOwner,
	isAdmin,
	isMe,
	channelId,
	isMuted,
	joinDM,
}: Props) => {
	const { mutate } = useSWRConfig();
	const [gameStatsOpened, { open, close }] = useDisclosure(false);
	const {
		data: blockedUsers,
		error,
		isLoading,
	} = useSWR<Array<{ login: string }>>("/user/blocked/all", fetcherPrivate);
	const chatSocket = useSocket("chat");
	const { gameSocket } = useSocketContext();
	const [gameSettings] = useAtom(gameSettingsAtom);

	const promoteToAdmin = async (member: GeneralUser) => {
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

	const blockMember = async (member: GeneralUser) => {
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

	const unblockMember = async (member: GeneralUser) => {
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
				(response: SocketResponse<unknown>) => {
					if (response.error) {
						const err = new Error();
						Object.assign(err, response.error);
						errorNotif(err);
					} else {
						mutate(`/channel/${channelId}`);
					}
				},
			);
		}
	};

	const muteMember = async (mutedId: string) => {
		try {
			const response = await axiosPrivate.post("/channel/admin/mute", {
				channelId,
				mutedId,
			});
			if (response.data.success) {
				notifications.show({
					color: "yellow",
					title: "User muted",
					message: `${member.login} has been muted for 5 minutes.`,
				});
				mutate(`/channel/${channelId}`);
			}
		} catch (e) {
			errorNotif(e);
		}
	};

	const unmuteMember = async (mutedId: string) => {
		try {
			const response = await axiosPrivate.post("/channel/admin/unmute", {
				channelId,
				mutedId,
			});
			if (response.data.success) {
				notifications.show({
					color: "green",
					title: "User unmuted",
					message: `${member.login} has been unmuted.`,
				});
				mutate(`/channel/${channelId}`);
			}
		} catch (e) {
			errorNotif(e);
		}
	};

	const handleInvite = (login: string) => {
		gameSocket.emit("create-invite", {
			settings: gameSettings,
			opponentLogin: login,
		});
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
			<StatsModal user={member} opened={gameStatsOpened} close={close} />
			{isMe ? (
				<UserCard
					user={member}
					icon={isMuted ? <IconVolumeOff size={18} /> : undefined}
				/>
			) : (
				<Menu>
					<Menu.Target>
						<UserCard
							user={member}
							icon={
								isMuted ? (
									<IconVolumeOff size={18} />
								) : undefined
							}
						/>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Item
							leftSection={<IconMessageCircle size={18} />}
							onClick={() => {
								joinDM(member.login);
							}}
						>
							Messages
						</Menu.Item>
						<Menu.Item
							leftSection={<IconUserScan size={18} />}
							onClick={open}
						>
							Gamer Profile
						</Menu.Item>
						<Menu.Item
							leftSection={<IconDeviceGamepad2 size={18} />}
							onClick={() => {
								handleInvite(member.login);
							}}
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
								{isMuted ? (
									<Menu.Item
										color="yellow"
										leftSection={<IconMessage size={18} />}
										onClick={() => unmuteMember(member.id)}
									>
										Unmute
									</Menu.Item>
								) : (
									<Menu.Item
										color="yellow"
										leftSection={
											<IconMessageOff size={18} />
										}
										onClick={() => muteMember(member.id)}
									>
										Mute (5mn)
									</Menu.Item>
								)}
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
