import { useElementSize } from "@mantine/hooks";
import { useState } from "react";
import ChannelsList from "../components/ChannelsList/ChannelsList";
import ChatArea from "../components/ChatArea/ChatArea";
import Footer from "../components/Footer/Footer";
import FriendsList from "../components/FriendsList/FriendsList";
import Header from "../components/Header/Header";
import LoginModal from "../components/LoginModal/LoginModal";
import MainFrame from "../components/MainFrame/MainFrame";
import { Channel } from "../types";
import { isLoggedCookie } from "../utils/readCookie";
import classes from "./Main.module.css";

export function MainPage() {
	const { ref, height: channelsHeight } = useElementSize();
	const [selectedChannel, setSelectedChannel] = useState<Channel>({
		id: -1,
		name: "",
	});
	const [chatOpened, setChatOpened] = useState(false);
	const [isLogged, setIsLogged] = useState(isLoggedCookie());

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
							setSelectedChannel={setSelectedChannel}
							setChatOpened={setChatOpened}
						/>
					</div>
					<div
						className={classes.friendsList}
						style={{ height: channelsHeight }}
					>
						<FriendsList height={channelsHeight - 5} />
					</div>
					<main className={classes.mainFrame}>
						<MainFrame />
					</main>
					<div
						className={classes.chatArea}
						style={{ display: chatOpened ? "block" : "none" }}
					>
						<ChatArea selectedChannel={selectedChannel} />
					</div>
					<div className={classes.footer}>
						<Footer />
					</div>
				</div>
			) : (
				<LoginModal setIsLogged={setIsLogged} />
			)}
		</>
	);
}
