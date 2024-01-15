import { Center, Loader } from "@mantine/core";
import useSWR from "swr";
import { ChannelInfos } from "../../types";
import { fetcherPrivate } from "../../utils/fetcher";
import ChannelChat from "./ChannelChat";
import DirectMessages from "./DirectMessages";
import { Socket } from "socket.io-client";

type Props = {
	chatSocket: Socket;
	channelId: string;
	login: string;
	joinDM: (friendLogin: string) => void;
	leaveChannel: (channelId: string) => void;
};

const Chat = ({
	chatSocket,
	channelId,
	login,
	joinDM,
	leaveChannel,
}: Props) => {
	const {
		data: channel,
		error,
		isLoading,
	} = useSWR<ChannelInfos>(`/channel/${channelId}`, fetcherPrivate);

	if (isLoading) {
		return (
			<Center className="h-100">
				<Loader type="dots" />
			</Center>
		);
	}

	if (error || !channel) {
		return <></>;
	}

	return channel.visibility === "DM" ? (
		<DirectMessages
			channel={channel}
			login={login}
			chatSocket={chatSocket}
		></DirectMessages>
	) : (
		<ChannelChat
			channel={channel}
			chatSocket={chatSocket}
			login={login}
			joinDM={joinDM}
			leaveChannel={leaveChannel}
		></ChannelChat>
	);
};

export default Chat;
