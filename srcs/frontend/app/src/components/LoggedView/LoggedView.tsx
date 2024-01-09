import { AppShell, Divider } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { mutate } from "swr";
import { useMyData } from "../../hooks/useMyData";
import { useSocket } from "../../hooks/useSocket";
import { Channel, SocketResponse } from "../../types";
import { errorNotif } from "../../utils/errorNotif";
import ChannelsList from "../ChannelsList/ChannelsList";
import ChatArea from "../ChatArea/ChatArea";
import Footer from "../Footer/Footer";
import FriendsList from "../FriendsList/FriendsList";
import Header from "../Header/Header";
import MainFrame from "../MainFrame/MainFrame";

type Props = {
	setIsLogged: Dispatch<SetStateAction<boolean>>;
};

const LoggedView = ({ setIsLogged }: Props) => {
	const { user, isLoading, error } = useMyData();
	const chatSocket = useSocket("chat");
	const [leftSectionOpened, { toggle: toggleLeftSection }] = useDisclosure();
	const [chatOpened, setChatOpened] = useState(false);
	const [selectedChannel, setSelectedChannel] = useState<string>("");

	useEffect(() => {
		chatSocket.on("user-kicked", (channelName: string) => {
			setChatOpened(false);
			notifications.show({
				message: `You have been kicked from the channel ${channelName}`,
				color: "red",
			});
			setSelectedChannel("");
		});
		chatSocket.on("user-joined", (channelId: string) => {
			mutate(`/channel/${channelId}`);
		});
		chatSocket.on("display-message", (channelId: string) => {
			mutate(`/channel/${channelId}`);
		});
		return () => {
			chatSocket.off("user-kicked");
			chatSocket.off("user-joined");
		};
	}, [chatSocket]);

	const joinChannel = (channel: Channel, password?: string) => {
		chatSocket.emit(
			"join-chatroom",
			{ channelId: channel.id, password },
			(response: SocketResponse) => {
				if (!response.success || response.error) {
					const err = new Error();
					Object.assign(err, response.error);
					errorNotif(err);
				} else {
					setSelectedChannel(channel.id);
					setChatOpened(true);
				}
			},
		);
	};

	return (
		<>
			{!error && !isLoading && (
				<AppShell
					header={{ height: 80 }}
					footer={{ height: 40 }}
					navbar={{
						width: 250,
						breakpoint: "md",
						collapsed: {
							mobile: !leftSectionOpened,
							desktop: !leftSectionOpened,
						},
					}}
					aside={{
						width: 340,
						breakpoint: "md",
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
						<ChannelsList joinChannel={joinChannel} />
						<Divider />
						<FriendsList chatSocket={chatSocket} />
					</AppShell.Navbar>
					<AppShell.Main>
						<MainFrame />
					</AppShell.Main>
					<AppShell.Aside>
						{selectedChannel && (
							<ChatArea
								user={user}
								channelId={selectedChannel}
								chatSocket={chatSocket}
							/>
						)}
					</AppShell.Aside>
					<AppShell.Footer p="xs">
						<Footer />
					</AppShell.Footer>
				</AppShell>
			)}
		</>
	);
};

export default LoggedView;
