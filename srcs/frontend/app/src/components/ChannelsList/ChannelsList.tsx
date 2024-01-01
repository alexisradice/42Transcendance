import { ScrollArea } from "@mantine/core";
import { Dispatch, SetStateAction } from "react";
import useSWR from "swr";
import { Channel } from "../../types";
import { fetcherPrivate } from "../../utils/fetcher";
import classes from "./ChannelsList.module.css";

type Props = {
	height: number;
	joinChannel: (channel: Channel) => void;
	setChatOpened: Dispatch<SetStateAction<boolean>>;
};

const ChannelsList = ({ height, joinChannel, setChatOpened }: Props) => {
	const { data, error, isLoading } = useSWR("/channel/list", fetcherPrivate);

	return (
		<>
			{!error && isLoading && <div>Loading...</div>}
			{!error && !isLoading && (
				<ScrollArea h={height} type="scroll" scrollbars="y">
					<ul className={classes.list}>
						{data.map((channel: Channel) => (
							<li
								key={channel.id}
								className={classes.item}
								onClick={() => {
									joinChannel(channel);
									setChatOpened(true);
								}}
							>
								{channel.name}
							</li>
						))}
					</ul>
				</ScrollArea>
			)}
		</>
	);
};

export default ChannelsList;
