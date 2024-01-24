import { GameStats, GeneralUser } from "../../types";
import { useMediaQuery } from "@mantine/hooks";
import {
	Center,
	Loader,
	Modal,
	Tabs,
	Timeline,
	Text,
	Avatar,
	Group,
	Grid,
	Table,
} from "@mantine/core";
import { fetcherPrivate } from "../../utils/fetcher";
import useSWR from "swr";
import {
	IconChartArrowsVertical,
	IconScale,
	IconThumbDown,
	IconTrophyFilled,
} from "@tabler/icons-react";

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
	const isMobile = useMediaQuery("(max-width: 50em)");

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

	const rows = data.gamesPlayed.map((game) => (
		<Table.Tr key={game.id}>
			<Table.Td c={game.winner.id === user.id ? "gold" : "dimmed"}>
				<Text ta="center">{game.winner.displayName}</Text>
			</Table.Td>
			<Table.Td c={game.winner.id === user.id ? "gold" : "dimmed"}>
				<Text ta="center">{game.winnerScore}</Text>
			</Table.Td>
			<Table.Td c={game.loser.id === user.id ? "red" : "dimmed"}>
				<Text ta="center">{game.loserScore}</Text>
			</Table.Td>
			<Table.Td c={game.loser.id === user.id ? "red" : "dimmed"}>
				<Text ta="center">{game.loser.displayName}</Text>
			</Table.Td>
		</Table.Tr>
	));

	return (
		<Modal
			opened={opened}
			onClose={close}
			title={`Gamer Profile of ${data.displayName} (@${data.login})`}
			centered
			fullScreen={isMobile}
			// size="xl"
		>
			<Tabs variant="outline" radius="md" defaultValue="stats">
				<Tabs.List grow>
					<Tabs.Tab value="stats">Stats</Tabs.Tab>
					<Tabs.Tab value="timeline">Last Matches</Tabs.Tab>
					<Tabs.Tab value="history">History</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value="stats" pt="xs">
					<Grid justify="space-around" align="flex-start">
						<Grid.Col span={6}>
							<Group>
								<IconTrophyFilled size={32} />
								<Text size="lg">{`${data.stats.wins} wins`}</Text>
							</Group>
						</Grid.Col>
						<Grid.Col span={6}>
							<Group>
								<IconThumbDown size={32} />
								<Text size="lg">{`${data.stats.losses} losses`}</Text>
							</Group>
						</Grid.Col>
						<Grid.Col span={6}>
							<Group>
								<IconChartArrowsVertical size={32} />
								<Text size="lg">{`Win streak: ${data.stats.winStreak}`}</Text>
							</Group>
						</Grid.Col>
						<Grid.Col span={6}>
							<Group>
								<IconScale size={32} />
								<Text size="lg">{`Win rate: ${Math.round((data.stats.wins * 100) / data.stats.gamesPlayed)}%`}</Text>
							</Group>
						</Grid.Col>
					</Grid>
				</Tabs.Panel>
				<Tabs.Panel value="timeline" pt="xs">
					<Timeline bulletSize={24}>
						{data.gamesPlayed.map((gamePlayed, index: number) => {
							if (index < 3) {
								return (
									<Timeline.Item
										key={gamePlayed.id}
										title={`${data.displayName} VS ${data.id === gamePlayed.winner.id ? gamePlayed.loser.displayName : gamePlayed.winner.displayName}`}
										bullet={
											<Avatar
												size={22}
												radius="xl"
												src={
													data.id ===
													gamePlayed.winner.id
														? gamePlayed.loser.image
														: gamePlayed.winner
																.image
												}
											/>
										}
									>
										<Text size="xs" c="dimmed">
											{`Ball speed: ${gamePlayed.ballSpeed}, Paddle size: ${gamePlayed.paddleSize}`}
										</Text>
										<Text size="xs" c="dimmed">
											{`Final score: ${gamePlayed.winnerScore} - ${gamePlayed.loserScore}`}
										</Text>
										<Text size="sm">
											{data.id === gamePlayed.winner.id
												? "VICTORY"
												: "DEFEAT"}
										</Text>
									</Timeline.Item>
								);
							}
						})}
					</Timeline>
				</Tabs.Panel>
				<Tabs.Panel value="history" pt="xs">
					<Table>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Winner</Table.Th>
								<Table.Th>Winning Score</Table.Th>
								<Table.Th>Losing Score</Table.Th>
								<Table.Th>Loser</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>{rows}</Table.Tbody>
					</Table>
				</Tabs.Panel>
			</Tabs>
		</Modal>
	);
};

export default StatsModal;
