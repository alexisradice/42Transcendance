import useSWR from "swr";
import { Channel, Message } from "../../types";
import { errorNotif } from "../../utils/errorNotif";
import { fetcherPrivate } from "../../utils/fetcher";
import classes from "./RightDrawer.module.css";
import { Title } from "@mantine/core";

type Props = {
	selectedChannel: Channel;
};

const RightDrawer = ({ selectedChannel }: Props) => {
	const { data, error, isLoading } = useSWR(
		`/channel/messages`,
		fetcherPrivate,
	);
	return (
		<>
			{error && errorNotif(error)}
			{!error && isLoading && <div>Loading...</div>}
			{!error && !isLoading && (
				<div className={classes.rightDrawer}>
					{selectedChannel.id !== -1 && (
						<>
							<Title className={classes.title}>
								{selectedChannel.name}
							</Title>
							{data.map((message: Message, index: number) => (
								<div key={index}>{message.content}</div>
							))}
						</>
					)}
				</div>
			)}
		</>
	);
};

export default RightDrawer;
