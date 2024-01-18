import {
	AppShell,
	Box,
	Button,
	Center,
	Indicator,
	Loader,
	ScrollArea,
	ScrollAreaAutosize,
	Tabs,
	Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { useMemo } from "react";
import useSWR from "swr";
import { DM } from "../../constants";
import { Channel, Notifs } from "../../types";
import { fetcherPrivate } from "../../utils/fetcher";
import UserCard from "../UserCard/UserCard";
import ChannelElement from "./ChannelElement";
import classes from "./ChannelsList.module.css";
import CreateChannelModal from "./CreateChannelModal";

type Props = {
	login: string;
	joinChannel: (channel: Channel, password?: string) => void;
	joinDM: (friendLogin: string) => void;
};

const ChannelsList = ({ login, joinChannel, joinDM }: Props) => {
	const [createModalOpened, { open, close }] = useDisclosure(false);
	const {
		data: channels,
		error,
		isLoading,
		mutate,
	} = useSWR<Channel[]>("/channel/list", fetcherPrivate);

	const { data: notifs } = useSWR<Notifs>(
		"/channel/notifications",
		fetcherPrivate,
	);

	const sortedChannels = useMemo(() => {
		const regularChannels: Channel[] = [];
		const DMs: Channel[] = [];

		channels?.forEach((channel: Channel) => {
			if (channel.visibility === DM) {
				DMs.push(channel);
			} else {
				regularChannels.push(channel);
			}
		});

		return { regularChannels, DMs };
	}, [channels]);

	const handleChannelCreated = () => {
		mutate();
	};

	if (isLoading) {
		return (
			<Center>
				<Loader type="dots" />
			</Center>
		);
	}

	if (error || !channels) {
		return <></>;
	}

	const hasNotifs = Object.keys(notifs || {}).find(
		(notifId) => notifs?.[notifId],
	);

	return (
		<AppShell.Section
			component={ScrollArea}
			type="scroll"
			className="h-100 flex-1"
		>
			<Tabs defaultValue="channels">
				<Tabs.List grow>
					<Tabs.Tab value="channels">Channels</Tabs.Tab>
					<Tabs.Tab value="messages">
						<Indicator
							position="middle-end"
							offset={-15}
							disabled={!hasNotifs}
							processing
							color="red"
							size={12}
						>
							Messages
						</Indicator>
					</Tabs.Tab>
				</Tabs.List>
				<CreateChannelModal
					opened={createModalOpened}
					close={close}
					handleChannelCreated={handleChannelCreated}
				/>

				<Tabs.Panel value="channels" component={ScrollAreaAutosize}>
					<Center>
						<Button onClick={open} variant="subtle" fullWidth>
							<IconPlus size={16} />
							<Text>&nbsp;Create channel</Text>
						</Button>
					</Center>
					{channels.length > 0 && (
						<ul className={classes.list}>
							{sortedChannels.regularChannels.map(
								(channel: Channel, index: number) => (
									<ChannelElement
										key={index}
										channel={channel}
										joinChannel={joinChannel}
									/>
								),
							)}
						</ul>
					)}
					{channels.length === 0 && (
						<Center className="h-100">
							<Text fs="italic" size="sm" c="dimmed">
								Nothing to see here
							</Text>
						</Center>
					)}
				</Tabs.Panel>

				<Tabs.Panel value="messages">
					{channels.length > 0 && (
						<ul className={classes.list}>
							{sortedChannels.DMs.map(
								(channel: Channel, index: number) => {
									const dest = channel.members.find(
										(member) => member.login !== login,
									)!;
									return (
										<Box
											key={index}
											onClick={() => {
												joinDM(dest.login);
											}}
										>
											<UserCard
												user={dest}
												hideStatus={true}
												notif={notifs?.[channel.id]}
											/>
										</Box>
									);
								},
							)}
						</ul>
					)}
					{channels.length === 0 && (
						<Center className="h-100">
							<Text fs="italic" size="sm" c="dimmed">
								Nothing to see here
							</Text>
						</Center>
					)}
				</Tabs.Panel>
			</Tabs>
		</AppShell.Section>
	);
};

export default ChannelsList;
