import { Input, Title, Tooltip } from "@mantine/core";
import { IconSend2 } from "@tabler/icons-react";
import useSWR from "swr";
import { Channel } from "../../types";
import { fetcherPrivate } from "../../utils/fetcher";
import MessagesArea from "../MessagesArea/MessagesArea";
import classes from "./ChatArea.module.css";

type Props = {
	selectedChannel: Channel;
};

const ChatArea = ({ selectedChannel }: Props) => {
	const {
		data: messages,
		error,
		isLoading,
	} = useSWR(`/channel/messages`, fetcherPrivate);

	return (
		<>
			{!error && isLoading && <div>Loading...</div>}
			{!error && !isLoading && selectedChannel.id !== -1 && (
				<div className={classes.chatArea}>
					<Tooltip label={selectedChannel.name}>
						<Title className={classes.title} lineClamp={1}>
							{selectedChannel.name}
						</Title>
					</Tooltip>
					<MessagesArea messages={messages} />
					<Input
						mt="sm"
						placeholder={`Message ${selectedChannel.name}`}
						rightSection={
							<IconSend2
								className={classes.sendButton}
								onClick={() => console.log("coucou")}
							/>
						}
						rightSectionPointerEvents="all"
					/>
				</div>
			)}
		</>
	);
};

export default ChatArea;
