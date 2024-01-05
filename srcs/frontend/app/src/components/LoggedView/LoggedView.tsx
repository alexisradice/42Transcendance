import { AppShell, Divider } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Dispatch, SetStateAction, useState } from "react";
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
	const chatSocket = useSocket("chat");
	const [leftSectionOpened, { toggle: toggleLeftSection }] = useDisclosure();
	const [chatOpened, setChatOpened] = useState(false);
	const [selectedChannel, setSelectedChannel] = useState<Channel>({
		id: -1,
		name: "",
		visibility: "",
	});
	const joinChannel = (channel: Channel) => {
		chatSocket.emit(
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
		<AppShell
			header={{ height: 80 }}
			footer={{ height: 40 }}
			navbar={{
				width: 300,
				breakpoint: "sm",
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
	);
};

export default LoggedView;
