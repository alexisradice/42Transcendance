import {
	AppShell,
	Button,
	Center,
	Loader,
	ScrollArea,
	Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import useSWR from "swr";
import { Channel } from "../../types";
import { fetcherPrivate } from "../../utils/fetcher";
import ChannelElement from "./ChannelElement";
import classes from "./ChannelsList.module.css";
import CreateChannelModal from "./CreateChannelModal";

type Props = {
	joinChannel: (channel: Channel, password?: string) => void;
};

const ChannelsList = ({ joinChannel }: Props) => {
	const [createModalOpened, { open, close }] = useDisclosure(false);
	const {
		data: channels,
		error,
		isLoading,
		mutate,
	} = useSWR("/channel/list", fetcherPrivate);

	const handleChannelCreated = (channel: Channel) => {
		mutate([...channels, channel]);
	};

	return (
		<>
			{!error && isLoading && (
				<Center>
					<Loader type="dots" />
				</Center>
			)}
			{!error && !isLoading && (
				<>
					<CreateChannelModal
						opened={createModalOpened}
						close={close}
						handleChannelCreated={handleChannelCreated}
					/>
					<Center>
						<Button onClick={open} variant="subtle" fullWidth>
							<IconPlus size={16} />
							<Text>&nbsp;Create channel</Text>
						</Button>
					</Center>
					{channels.length > 0 && (
						<AppShell.Section
							component={ScrollArea}
							type="scroll"
							className="h-100 flex-1"
						>
							<ul className={classes.list}>
								{channels.map(
									(channel: Channel, index: number) => (
										<ChannelElement
											key={index}
											channel={channel}
											joinChannel={joinChannel}
										/>
									),
								)}
							</ul>
						</AppShell.Section>
					)}
					{channels.length === 0 && (
						<AppShell.Section className="flex-1">
							<Center className="h-100">
								<Text fs="italic" size="sm" c="dimmed">
									Nothing to see here
								</Text>
							</Center>
						</AppShell.Section>
					)}
				</>
			)}
		</>
	);
};

export default ChannelsList;
