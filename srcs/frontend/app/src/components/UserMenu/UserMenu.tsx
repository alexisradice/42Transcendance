import { Center, Loader, Menu } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { errorNotif } from "../../utils/errorNotif";
import { axiosPrivate } from "../../utils/fetcher";
import AccountSettings from "../AccountSettings/AccountSettings";
import ProfileSettings from "../ProfileSettings/ProfileSettings";
import { useSocket } from "../../hooks/useSocket";
import { OFFLINE } from "../../constants";
import { useSocketContext } from "../../context/useContextGameSocket";
import StatsModal from "../StatsModal/StatsModal";
import { useMyData } from "../../hooks/useMyData";
import { useAtom } from "jotai";
import { firstTimeLogin } from "../../context/atoms";
import { useEffect } from "react";
import { useSWRConfig } from "swr";

type Props = {
	children: JSX.Element;
	setIsLogged: React.Dispatch<React.SetStateAction<boolean>>;
};

const UserMenu = ({ children, setIsLogged }: Props) => {
	const { mutate } = useSWRConfig();
	const chatSocket = useSocket("chat");
	const [firstTimeLoginAtom, setFirstTimeLoginAtom] = useAtom(firstTimeLogin);
	const { user, error, isLoading } = useMyData();
	const { gameSocket, setIsPending } = useSocketContext();
	const [gameStatsOpened, { open: openStats, close: closeStats }] =
		useDisclosure(false);
	const [profileOpened, { open: openProfile, close: closeProfile }] =
		useDisclosure(false);
	const [accountOpened, { open: openAccount, close: closeAccount }] =
		useDisclosure(false);

	useEffect(() => {
		if (firstTimeLoginAtom) {
			if (
				confirm(
					"Hello there, newcomer. Do you want to customize your display name and profile picture?",
				)
			) {
				openProfile();
			}
			setFirstTimeLoginAtom(false);
		}
	}, [firstTimeLoginAtom]);

	const logOut = async () => {
		try {
			await axiosPrivate.patch("/auth/logout");

			chatSocket.emit("change-status", OFFLINE);
			setIsLogged(false);

			gameSocket.emit("leave-lobby");
			setIsPending(false);
		} catch (err: unknown) {
			errorNotif(err);
		}
	};

	if (isLoading) {
		return (
			<Center>
				<Loader type="dots" />
			</Center>
		);
	}

	if (error || !user) {
		return <></>;
	}

	const handleOpenStats = () => {
		mutate(`/user/stats/${user.id}`);
		openStats();
	};

	return (
		<>
			<StatsModal
				user={user}
				opened={gameStatsOpened}
				close={closeStats}
			/>
			<ProfileSettings opened={profileOpened} close={closeProfile} />
			<AccountSettings opened={accountOpened} close={closeAccount} />

			<Menu shadow="md" width={150}>
				<Menu.Target>{children}</Menu.Target>
				<Menu.Dropdown>
					<Menu.Item onClick={openProfile}>Update Profile</Menu.Item>
					<Menu.Item onClick={handleOpenStats}>Game Stats</Menu.Item>
					<Menu.Item onClick={openAccount}>Account</Menu.Item>
					<Menu.Item onClick={logOut}>Log out</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</>
	);
};

export default UserMenu;
