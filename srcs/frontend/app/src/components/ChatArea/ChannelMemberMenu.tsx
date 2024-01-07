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
import { ChannelMember } from "../../types";
import UserCard from "../UserCard/UserCard";
import useSWR from "swr";
import { fetcherPrivate } from "../../utils/fetcher";

type Props = {
	member: ChannelMember;
	memberRole: string;
	isOwner: boolean;
	isAdmin: boolean;
	isMe: boolean;
	promoteToAdmin?: (member: ChannelMember) => void;
	blockMember: (member: ChannelMember) => void;
	unblockMember: (member: ChannelMember) => void;
};

const ChannelMemberMenu = ({
	member,
	memberRole,
	isOwner,
	isAdmin,
	isMe,
	promoteToAdmin,
	blockMember,
	unblockMember,
}: Props) => {
	const {
		data: blockedUsers,
		error,
		isLoading,
		mutate,
	} = useSWR<Array<{ login: string }>>("/user/blocked/all", fetcherPrivate);

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
									mutate();
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
									mutate();
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
								>
									Kick
								</Menu.Item>
								<Menu.Item
									color="red"
									leftSection={<IconHammer size={18} />}
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
