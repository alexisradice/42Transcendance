import { useElementSize } from "@mantine/hooks";
import { useEffect, useState } from "react";
import ChannelsList from "../components/ChannelsList/ChannelsList";
import ChatArea from "../components/ChatArea/ChatArea";
import Footer from "../components/Footer/Footer";
import FriendsList from "../components/FriendsList/FriendsList";
import Header from "../components/Header/Header";
import LoginModal from "../components/LoginModal/LoginModal";
import MainFrame from "../components/MainFrame/MainFrame";
import { Channel, SocketResponse } from "../types";
import { isLoggedCookie, jwtToken } from "../utils/readCookie";
import classes from "./Main.module.css";
import { Socket, io } from "socket.io-client";
import { axiosPrivate } from "../utils/fetcher";
import { errorNotif } from "../utils/errorNotif";

export function MainPage() {
	const [chatSocket, setChatSocket] = useState<Socket | null>(null);
	const { ref, height: channelsHeight } = useElementSize();
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
				<div className={classes.main}>
					<div className={classes.header}>
						<Header
							chatOpened={chatOpened}
							setIsLogged={setIsLogged}
							setChatOpened={setChatOpened}
							selectedChannel={selectedChannel.id !== -1}
						/>
					</div>
					<div ref={ref} className={classes.channelsList}>
						<ChannelsList
							height={channelsHeight - 5}
							joinChannel={joinChannel}
							setChatOpened={setChatOpened}
						/>
					</div>
					<div
						className={classes.friendsList}
						style={{ height: channelsHeight }}
					>
						<FriendsList
							chatSocket={chatSocket}
							height={channelsHeight - 5}
						/>
					</div>
					<main className={classes.mainFrame}>
						<MainFrame />
					</main>
					<div
						className={classes.chatArea}
						style={{ display: chatOpened ? "block" : "none" }}
					>
						{selectedChannel.id !== -1 && (
							<ChatArea
								selectedChannel={selectedChannel}
								chatSocket={chatSocket}
							/>
						)}
					</div>
					<div className={classes.footer}>
						<Footer />
					</div>
				</div>
			) : (
				<>
					<LoginModal setIsLogged={setIsLogged} />
					<div className={classes.main}>
						<div className={classes.header}></div>
						<div ref={ref} className={classes.channelsList}></div>
						<div
							className={classes.friendsList}
							style={{ height: channelsHeight }}
						></div>
						<main className={classes.mainFrame}></main>
						<div className={classes.chatArea}></div>
						<div className={classes.footer}></div>
					</div>
				</>
			)}
		</>
	);
}
