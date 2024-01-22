import { GameStats, GeneralUser } from "../../types";
import {
	Center,
	Loader,
	Modal,
	Tabs,
	Timeline,
	Text,
	Avatar,
} from "@mantine/core";
import { fetcherPrivate } from "../../utils/fetcher";
import useSWR from "swr";

type Props = {
	user: GeneralUser;
	opened: boolean;
	close: any;
};

const StatsModal = ({ user, opened, close }: Props) => {
	const { data, isLoading, error } = useSWR<GameStats>(
		`/user/stats/${user.id}`,
		fetcherPrivate,
	);

	if (isLoading) {
		return (
			<Center>
				<Loader type="dots" />
			</Center>
		);
	}

	if (error || !data) {
		return <></>;
	}

	return (
		<Modal
			opened={opened}
			onClose={close}
			title="Gamer Stats and Match History"
			centered
		>
			<Tabs variant="outline" radius="md" defaultValue="stats">
				<Tabs.List grow>
					<Tabs.Tab value="stats">Stats</Tabs.Tab>
					<Tabs.Tab value="timeline">Last Matches</Tabs.Tab>
					<Tabs.Tab value="history">History</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value="stats" pt="xs">
					<Text size="sm">
						Here you can(not, for the moment) see the game stats
					</Text>
				</Tabs.Panel>
				<Tabs.Panel value="timeline" pt="xs">
					<Timeline bulletSize={24}>
						{data.gamesPlayed.map((gamePlayed, index: number) => {
							if (index < 3) {
								return (
									<Timeline.Item
										key={gamePlayed.id}
										title="COMBAT"
										bullet={
											<Avatar
												size={22}
												radius="xl"
												src={gamePlayed.winner.image}
											/>
										}
									>
										{`winner was ${gamePlayed.winner.displayName}`}
									</Timeline.Item>
								);
							}
						})}
					</Timeline>
				</Tabs.Panel>
				<Tabs.Panel value="history" pt="xs">
					the full matches history goes here
				</Tabs.Panel>
			</Tabs>
			{/* <Timeline.Item title="DERNIER COMBAT">
					{data.gamesPlayed[0].winner.displayName}
				</Timeline.Item>
				<Timeline.Item title="AVANT DERNIER COMBAT">
					{data.gamesPlayed[0].winner.displayName}
				</Timeline.Item>
				<Timeline.Item title="AVANT AVANT DERNIER COMBAT">
					{data.gamesPlayed[0].winner.displayName}
				</Timeline.Item> */}
			{/* <Timeline.Item
					title="Avatar"
					bullet={
						<Avatar
							size={22}
							radius="xl"
							src="https://avatars0.githubusercontent.com/u/10353856?s=460&u=88394dfd67727327c1f7670a1764dc38a8a24831&v=4"
						/>
					}
				>
					Timeline bullet as avatar image
				</Timeline.Item>
				<Timeline.Item title="Icon" bullet={<IconSun size="0.8rem" />}>
					Timeline bullet as icon
				</Timeline.Item>
				<Timeline.Item
					title="ThemeIcon"
					bullet={
						<ThemeIcon
							size={22}
							variant="gradient"
							gradient={{ from: "lime", to: "cyan" }}
							radius="xl"
						>
							<IconVideo size="0.8rem" />
						</ThemeIcon>
					}
				>
					Timeline bullet as ThemeIcon component
				</Timeline.Item> */}
			{/* </Timeline> */}
		</Modal>
	);
};

export default StatsModal;
