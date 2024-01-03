import { AppShell, Divider } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import ChannelsList from "../components/ChannelsList/ChannelsList";
import ChatArea from "../components/ChatArea/ChatArea";
import Footer from "../components/Footer/Footer";
import FriendsList from "../components/FriendsList/FriendsList";
import Header from "../components/Header/Header";
import LoginModal from "../components/LoginModal/LoginModal";
import MainFrame from "../components/MainFrame/MainFrame";
import { Channel, SocketResponse } from "../types";
import { errorNotif } from "../utils/errorNotif";
import { axiosPrivate } from "../utils/fetcher";
import { isLoggedCookie, jwtToken } from "../utils/readCookie";

export function MainPage() {
	const [leftSectionOpened, { toggle: toggleLeftSection }] = useDisclosure();
	const [chatSocket, setChatSocket] = useState<Socket | null>(null);
	const [selectedChannel, setSelectedChannel] = useState<Channel>({
		id: -1,
		name: "",
		visibility: "",
	});
	const [chatOpened, setChatOpened] = useState(false);
	const [isLogged, setIsLogged] = useState(isLoggedCookie());

	useEffect(() => {
		if (isLogged && !chatSocket) {
			axiosPrivate
				.get("/user/me")
				.then(() => {
					setChatSocket(
						io(`${import.meta.env.VITE_API_URL}/chat`, {
							query: { token: jwtToken() },
						}),
					);
				})
				.catch((err) => {
					console.error(err);
				});
		}
		return () => {
			chatSocket?.disconnect();
		};
	}, [chatSocket, isLogged]);

	const joinChannel = (channel: Channel) => {
		chatSocket?.emit(
			"join-chatroom",
			{ channelId: channel.id },
			(response: SocketResponse) => {
				if (!response.success || response.error) {
					errorNotif(response.error);
				} else {
					setSelectedChannel(channel);
				}
			},
		);
	};

	return (
		<>
			{isLogged ? (
				<AppShell
					header={{ height: 80 }}
					footer={{ height: 40 }}
					navbar={{
						width: 300,
						breakpoint: "md",
						collapsed: {
							mobile: !leftSectionOpened,
						},
					}}
					aside={{
						width: 340,
						breakpoint: "md",
						collapsed: {
							mobile: !chatOpened || selectedChannel.id === -1,
							desktop: !chatOpened || selectedChannel.id === -1,
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
							selectedChannel={selectedChannel.id !== -1}
						/>
					</AppShell.Header>
					<AppShell.Navbar>
						<ChannelsList
							joinChannel={joinChannel}
							setChatOpened={setChatOpened}
						/>
						<Divider />
						<FriendsList chatSocket={chatSocket} />
					</AppShell.Navbar>
					<AppShell.Main>
						<MainFrame />
					</AppShell.Main>
					<AppShell.Aside>
						{selectedChannel.id !== -1 && (
							<ChatArea
								selectedChannel={selectedChannel}
								chatSocket={chatSocket}
							/>
						)}
					</AppShell.Aside>
					<AppShell.Footer p="xs">
						<Footer />
					</AppShell.Footer>
				</AppShell>
			) : (
				<LoginModal setIsLogged={setIsLogged} />
			)}
		</>
	);
}
