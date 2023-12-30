import { createRef, useEffect, useState } from "react";
import ChannelsList from "../components/ChannelsList/ChannelsList";
import Footer from "../components/Footer/Footer";
import FriendsList from "../components/FriendsList/FriendsList";
import Header from "../components/Header/Header";
import LoginModal from "../components/LoginModal/LoginModal";
import MainFrame from "../components/MainFrame/MainFrame";
import ChatArea from "../components/ChatArea/ChatArea";
import { isLoggedCookie } from "../utils/readCookie";
import classes from "./Main.module.css";
import { Channel } from "../types";

export function MainPage() {
	const [selectedChannel, setSelectedChannel] = useState<Channel>({
		id: -1,
		name: "",
	});
	const [chatOpened, setChatOpened] = useState(false);
	const [, setWindowSize] = useState([0, 0]);
	const leftSectionRef = createRef<HTMLDivElement>();
	const [leftSectionHeight, setLeftSectionHeight] = useState(0);
	const [isLogged, setIsLogged] = useState(isLoggedCookie());

	useEffect(() => {
		const updateSize = () => {
			setWindowSize([window.innerWidth, window.innerHeight]);
		};
		window.addEventListener("resize", updateSize);
		return () => {
			window.removeEventListener("resize", updateSize);
		};
	}, []);

	useEffect(() => {
		if (leftSectionRef.current) {
			setLeftSectionHeight(leftSectionRef.current?.clientHeight);
		}
	}, [leftSectionRef]);

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
					<div ref={leftSectionRef} className={classes.channelsList}>
						<ChannelsList
							height={leftSectionHeight - 5}
							setSelectedChannel={setSelectedChannel}
							setChatOpened={setChatOpened}
						/>
					</div>
					<div className={classes.friendsList}>
						<FriendsList height={leftSectionHeight - 5} />
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
