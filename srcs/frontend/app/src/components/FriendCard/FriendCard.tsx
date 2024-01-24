import { Menu } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
	IconBan,
	IconDeviceGamepad2,
	IconMessageCircle,
	IconTrash,
	IconUserScan,
} from "@tabler/icons-react";
import { useAtom } from "jotai";
import { gameSettingsAtom } from "../../context/atoms";
import { useSocketContext } from "../../context/useContextGameSocket";
import { GeneralUser, SocketResponse } from "../../types";
import StatsModal from "../StatsModal/StatsModal";
import UserCard from "../UserCard/UserCard";
import { errorNotif } from "../../utils/errorNotif";

type Props = {
	friend: GeneralUser;
	joinDM: (friendLogin: string) => void;
	removeFriend: (friendLogin: string) => void;
	blockFriend: (friendLogin: string) => void;
};

const FriendCard = ({ friend, joinDM, removeFriend, blockFriend }: Props) => {
	const [gameSettings] = useAtom(gameSettingsAtom);
	const { gameSocket, setIsPending } = useSocketContext();
	const [gameStatsOpened, { open, close }] = useDisclosure(false);
	const handleRemove = () => {
		if (
			window.confirm(`Are you sure you want to remove ${friend.login}?`)
		) {
			removeFriend(friend.login);
		}
	};
	const handleBlock = () => {
		if (
			window.confirm(
				`Are you sure you want to block ${friend.login}? This will also remove them from your friends list.`,
			)
		) {
			blockFriend(friend.login);
		}
	};
	const handleInvite = () => {
		if (
			confirm(
				`You'll invite ${friend.login} your current selected game settings. Is this ok?`,
			)
		) {
			gameSocket.emit(
				"create-invite",
				{
					settings: gameSettings,
					opponentLogin: friend.login,
				},
				(response: SocketResponse<undefined>) => {
					if (response.error) {
						const error = new Error();
						Object.assign(error, response.error);
						errorNotif(error);
					} else {
						setIsPending(true);
					}
				},
			);
		}
	};

	return (
		<>
			<StatsModal user={friend} opened={gameStatsOpened} close={close} />
			<Menu>
				<Menu.Target>
					<UserCard user={friend} chevron={true} />
				</Menu.Target>
				<Menu.Dropdown>
					<Menu.Item
						leftSection={<IconMessageCircle size={18} />}
						onClick={() => {
							joinDM(friend.login);
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
						onClick={handleInvite}
					>
						Invite to play
					</Menu.Item>
					<Menu.Item
						color="red"
						onClick={handleRemove}
						leftSection={<IconTrash size={18} />}
					>
						Remove friend
					</Menu.Item>
					<Menu.Item
						color="red"
						onClick={handleBlock}
						leftSection={<IconBan size={18} />}
					>
						Block friend
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</>
	);
};

export default FriendCard;
