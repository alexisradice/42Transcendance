import { Group, Loader, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { PROTECTED } from "../../constants";
import { useMyData } from "../../hooks/useMyData";
import { Channel } from "../../types";
import { IconHash, IconHashLock } from "../Icons";
import classes from "./ChannelsList.module.css";
import JoinProtectedModal from "./JoinProtectedModal";

type Props = {
	joinChannel: (channel: Channel, password?: string) => void;
	channel: Channel;
};

const ChannelElement = ({ joinChannel, channel }: Props) => {
	const { user, error, isLoading } = useMyData();
	const [passwordModalOpened, { open, close }] = useDisclosure(false);

	return (
		<>
			{!error && isLoading && <Loader type="dots" />}
			{!error && !isLoading && (
				<>
					<JoinProtectedModal
						opened={passwordModalOpened}
						close={close}
						onSuccess={(password: string) => {
							joinChannel(channel, password);
						}}
					/>
					<li
						key={channel.id}
						className={classes.item}
						onClick={() => {
							if (
								channel.visibility === PROTECTED &&
								!channel.members.some(
									(member) => member.login === user.login,
								)
							) {
								open(); // password modal
							} else {
								joinChannel(channel);
							}
						}}
					>
						<Group justify="space-between" align="center" gap={5}>
							{channel.visibility === PROTECTED ? (
								<IconHashLock size={22} />
							) : (
								<IconHash size={22} />
							)}
							<Text lineClamp={1} className="flex-1">
								{channel.name}
							</Text>
						</Group>
					</li>
				</>
			)}
		</>
	);
};

export default ChannelElement;
