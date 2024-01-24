import {
	Avatar,
	Center,
	Group,
	Loader,
	Modal,
	Stack,
	Table,
	Tabs,
	Text,
	Timeline,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
	IconChartArrowsVertical,
	IconMoodLookDown,
	IconScale,
	IconTrophy,
} from "@tabler/icons-react";
import cx from "clsx";
import useSWR from "swr";
import { BALL_MARKS, PADDLE_MARKS } from "../../constants";
import { GameStats, GeneralUser } from "../../types";
import { fetcherPrivate } from "../../utils/fetcher";
import classes from "./StatsModal.module.css";

type Props = {
	user: GeneralUser;
	opened: boolean;
	close: () => void;
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

	const winRate = Math.round(
		(data.stats.wins * 100) / data.stats.gamesPlayed,
	);

	const winStreak = data.stats.winStreak;

	const getFormattedValue = (type: string, value: number) => {
		if (type === "ball") {
			return BALL_MARKS.find((mark) => mark.value === value)!.label;
		}
		return PADDLE_MARKS.find((mark) => mark.value === value)!.label;
	};

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
		>
			<Tabs variant="default" radius="md" defaultValue="stats">
				<Tabs.List grow>
					<Tabs.Tab value="stats">Stats</Tabs.Tab>
					<Tabs.Tab value="timeline">Last Matches</Tabs.Tab>
					<Tabs.Tab value="history">History</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value="stats" pt="md" h={350}>
					<Stack className={classes.stack}>
						<Group>
							<IconTrophy size={40} color="gold" />
							<Text
								className={classes.statsText}
							>{`${data.stats.wins} wins`}</Text>
						</Group>
						<Group>
							<IconMoodLookDown size={40} color="red" />
							<Text
								className={classes.statsText}
							>{`${data.stats.losses} losses`}</Text>
						</Group>
						<Group>
							<IconChartArrowsVertical size={40} />
							<Text className={classes.statsText}>
								Win streak
								<span
									className={cx({
										[classes.scoreValue]: true,
										[classes.scoreColorSuccess]:
											winStreak > 0,
										[classes.scoreColorFailure]:
											winStreak <= 0,
									})}
								>
									{winStreak}
								</span>
							</Text>
						</Group>
						<Group>
							<IconScale size={40} />
							<Text className={classes.statsText}>
								Win rate
								<span
									className={cx({
										[classes.scoreValue]: true,
										[classes.scoreColorSuccess]:
											winRate >= 50,
										[classes.scoreColorFailure]:
											winRate < 50,
									})}
								>
									{`${winRate}%`}
								</span>
							</Text>
						</Group>
					</Stack>
				</Tabs.Panel>
				<Tabs.Panel value="timeline" pt="md" h={350}>
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
											{`Ball speed: ${getFormattedValue("ball", gamePlayed.ballSpeed)}, Paddle size: ${getFormattedValue("paddle", gamePlayed.paddleSize)}`}
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
				<Tabs.Panel value="history" pt="md" h={350}>
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
