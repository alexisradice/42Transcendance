import { AppShell, Center, Divider, Loader } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
	Dispatch,
	SetStateAction,
	useCallback,
	useEffect,
	useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { useSWRConfig } from "swr";
import { useSocketContext } from "../../context/useContextGameSocket";
import { useMyData } from "../../hooks/useMyData";
import { useSocket } from "../../hooks/useSocket";
import {
	Channel,
	DMChannel,
	GeneralUser,
	SocketResponse,
	Status,
} from "../../types";
import { errorNotif } from "../../utils/errorNotif";
import ChannelsList from "../ChannelsList/ChannelsList";
import Chat from "../Chat/Chat";
import Footer from "../Footer/Footer";
import FriendsList from "../FriendsList/FriendsList";
import Header from "../Header/Header";
import MainFrame from "../MainFrame/MainFrame";

type Props = {
	setIsLogged: Dispatch<SetStateAction<boolean>>;
};

const LoggedView = ({ setIsLogged }: Props) => {
	const { cache, mutate } = useSWRConfig();
	const { user, isLoading, error } = useMyData();
	const chatSocket = useSocket("chat");
	const { gameSocket, setIsPending } = useSocketContext();
	const navigate = useNavigate();
	const isDesktopResolution = useMediaQuery("(min-width: 768px)");
	const [leftSectionOpened, { open, close, toggle: toggleLeftSection }] =
		useDisclosure();
	const [chatOpened, setChatOpened] = useState(false);
	const [selectedChannel, setSelectedChannel] = useState<string>("");

	const leaveChannel = useCallback(
		(channelId?: string) => {
			setChatOpened(false);
			setSelectedChannel("");
			mutate("/channel/list");
			if (channelId) {
				mutate(`/channel/${channelId}`);
			}
		},
		[mutate],
	);

	useEffect(() => {
		if (chatOpened) {
			chatSocket.emit("toggle-chat", selectedChannel);
		} else {
			chatSocket.emit("toggle-chat");
		}
	}, [chatSocket, chatOpened, selectedChannel]);

	useEffect(() => {
		if (isDesktopResolution) {
			open();
			if (selectedChannel) {
				setChatOpened(true);
			}
		} else {
			close();
			setChatOpened(false);
		}
	}, [isDesktopResolution, open, close, setChatOpened, selectedChannel]);

	useEffect(() => {
		const handleStatusChanged = (response: {
			login: string;
			status: Status;
		}) => {
			const { login, status } = response;
			const friendsList = cache.get("/user/friends/all")?.data;
			if (friendsList) {
				const friend = friendsList.find(
					(friend: GeneralUser) => friend.login === login,
				);
				if (friend) {
					friend.status = status;
					mutate("/user/friends/all");
				}
			}
			if (selectedChannel) {
				mutate(`/channel/${selectedChannel}`);
			}
		};

		chatSocket.on("channel-destroyed", () => {
			mutate("/channel/list");
		});
		chatSocket.on("user-left", (channelId: string) => {
			mutate(`/channel/${channelId}`);
		});
		chatSocket.on(
			"user-kicked",
			(channel: { action: string; channelName: string }) => {
				const { action, channelName } = channel;
				const verb = action === "ban" ? "banned" : "kicked";
				leaveChannel();
				notifications.show({
					message: `You have been ${verb} from the channel ${channelName}`,
					color: "red",
				});
			},
		);
		chatSocket.on("user-joined", (channelId: string) => {
			mutate(`/channel/${channelId}`);
		});
		chatSocket.on("display-message", (channelId: string) => {
			mutate(`/channel/${channelId}`);
		});

		chatSocket.on("status-changed", handleStatusChanged);
		gameSocket.on("status-changed", handleStatusChanged);

		chatSocket.on("notif", () => {
			mutate("/channel/notifications");
		});

		gameSocket.on("display-invite", (channelId: string) => {
			mutate(`/channel/${channelId}`);
		});

		gameSocket.on("launch", ({ lobbyId }: { lobbyId: string }) => {
			setIsPending(false);
			setChatOpened(false);
			close();
			navigate(`/game/${lobbyId}`);
		});

		return () => {
			chatSocket.off("channel-destroyed");
			chatSocket.off("user-left");
			chatSocket.off("user-kicked");
			chatSocket.off("user-joined");
			chatSocket.off("display-message");
			chatSocket.off("status-changed");
			chatSocket.off("notif");
			gameSocket.off("display-invite");
			gameSocket.off("status-changed");
			gameSocket.off("launch");
		};
	}, [
		chatSocket,
		cache,
		mutate,
		selectedChannel,
		leaveChannel,
		gameSocket,
		setIsPending,
		navigate,
		close,
	]);

	const openChannel = (channelId: string) => {
		setChatOpened(true);
		setSelectedChannel(channelId);
		mutate(`/channel/${channelId}`);
		mutate(`/channel/list`);
	};

	const joinChannel = (channel: Channel, password?: string) => {
		chatSocket.emit(
			"join-chatroom",
			{ channelId: channel.id, password },
			(response: SocketResponse<unknown>) => {
				if (response.error) {
					const err = new Error();
					Object.assign(err, response.error);
					errorNotif(err);
				} else {
					openChannel(channel.id);
				}
			},
		);
	};

	const joinDM = (friendLogin: string) => {
		chatSocket.emit(
			"join-dm",
			{ destLogin: friendLogin },
			(response: SocketResponse<DMChannel>) => {
				if (response.error) {
					const err = new Error();
					Object.assign(err, response.error);
					errorNotif(err);
				} else if (response.data) {
					const dmChannel = response.data;
					openChannel(dmChannel.id);
					mutate("/channel/notifications");
				} else {
					console.warn("No data received from join-dm");
				}
			},
		);
	};

	if (isLoading) {
		return (
			<Center>
				<Loader type="dots" />
			</Center>
		);
	}

	if (error || !user) {
		return <></>;
	}

	return (
		<AppShell
			header={{ height: 80 }}
			footer={{ height: 40 }}
			navbar={{
				width: 250,
				breakpoint: "xs",
				collapsed: {
					mobile: !leftSectionOpened,
					desktop: !leftSectionOpened,
				},
			}}
			aside={{
				width: 350,
				breakpoint: "xs",
				collapsed: {
					mobile: !chatOpened || selectedChannel === "",
					desktop: !chatOpened || selectedChannel === "",
				},
			}}
		>
			<AppShell.Header p="sm">
				<Header
					leftSectionOpened={leftSectionOpened}
					toggleLeftSection={toggleLeftSection}
					chatOpened={chatOpened}
					setChatOpened={setChatOpened}
					setIsLogged={setIsLogged}
					selectedChannel={selectedChannel !== ""}
				/>
			</AppShell.Header>
			<AppShell.Navbar>
				<ChannelsList
					login={user.login}
					joinChannel={joinChannel}
					joinDM={joinDM}
				/>
				<Divider />
				<FriendsList joinDM={joinDM} />
			</AppShell.Navbar>
			<AppShell.Main>
				<MainFrame />
			</AppShell.Main>
			<AppShell.Aside>
				{selectedChannel && (
					<Chat
						chatSocket={chatSocket}
						login={user.login}
						channelId={selectedChannel}
						leaveChannel={leaveChannel}
						joinDM={joinDM}
					/>
				)}
			</AppShell.Aside>
			<AppShell.Footer p="xs">
				<Footer />
			</AppShell.Footer>
		</AppShell>
	);
};

export default LoggedView;
