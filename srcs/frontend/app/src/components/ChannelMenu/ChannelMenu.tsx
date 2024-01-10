import {
	Button,
	Group,
	Loader,
	Menu,
	Modal,
	PasswordInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import {
	IconDoorExit,
	IconPassword,
	IconSettings,
	IconShieldOff,
	IconShieldPlus,
} from "@tabler/icons-react";
import { useState } from "react";

type Props = {
	isOwner: boolean;
	hasPassword: boolean;
	addPassword: (password: string) => Promise<void>;
	changePassword: (password: string) => Promise<void>;
	removePassword: () => Promise<void>;
	leaveChatRoom: () => void;
};

const ChannelMenu = ({
	isOwner,
	hasPassword,
	addPassword,
	changePassword,
	removePassword,
	leaveChatRoom,
}: Props) => {
	const [opened, { open, close }] = useDisclosure(false);
	const [changePassOpened, { open: changePassOpen, close: changePassClose }] =
		useDisclosure(false);
	const [loading, setLoading] = useState<boolean>(false);

	const addPasswordForm = useForm({
		initialValues: {
			password: "",
		},
		validate: {
			password: (value: string) => {
				if (value.length >= 8) {
					return null;
				}
				return "Password must be at least 8 characters long";
			},
		},
	});

	const changePasswordForm = useForm({
		initialValues: {
			password: "",
		},
		validate: {
			password: (value: string) => {
				if (value.length >= 8) {
					return null;
				}
				return "Password must be at least 8 characters long";
			},
		},
	});

	const closeAddPassword = () => {
		close();
		setLoading(false);
		addPasswordForm.reset();
	};

	const closeChangePassword = () => {
		changePassClose();
		setLoading(false);
		changePasswordForm.reset();
	};

	const addPasswordSubmit = async () => {
		addPassword(addPasswordForm.values.password);
		closeAddPassword();
	};

	const changePasswordSubmit = async () => {
		changePassword(changePasswordForm.values.password);
		closeChangePassword();
	};

	return (
		<>
			<Modal
				radius="md"
				centered={true}
				opened={opened}
				onClose={closeAddPassword}
				title="Add password"
				overlayProps={{
					backgroundOpacity: 0.55,
					blur: 3,
				}}
			>
				<form onSubmit={addPasswordForm.onSubmit(addPasswordSubmit)}>
					<PasswordInput
						mt="md"
						label="Password"
						placeholder="Channel password"
						{...addPasswordForm.getInputProps("password")}
						disabled={loading}
						data-autofocus
					/>
					<Group justify="flex-end">
						<Button
							type="submit"
							color="blue"
							mt="lg"
							disabled={loading}
							rightSection={
								loading ? <Loader type="dots" /> : null
							}
						>
							Add password to channel
						</Button>
					</Group>
				</form>
			</Modal>
			<Modal
				radius="md"
				centered={true}
				opened={changePassOpened}
				onClose={closeChangePassword}
				title="Change password"
				overlayProps={{
					backgroundOpacity: 0.55,
					blur: 3,
				}}
			>
				<form
					onSubmit={changePasswordForm.onSubmit(changePasswordSubmit)}
				>
					<PasswordInput
						mt="md"
						label="Password"
						placeholder="Channel password"
						{...changePasswordForm.getInputProps("password")}
						disabled={loading}
						data-autofocus
					/>
					<Group justify="flex-end">
						<Button
							type="submit"
							color="blue"
							mt="lg"
							disabled={loading}
							rightSection={
								loading ? <Loader type="dots" /> : null
							}
						>
							Change channel's password
						</Button>
					</Group>
				</form>
			</Modal>
			<Menu>
				<Menu.Target>
					<IconSettings />
				</Menu.Target>
				<Menu.Dropdown>
					{isOwner && (
						<>
							{!hasPassword ? (
								<Menu.Item
									leftSection={<IconShieldPlus size={18} />}
									onClick={open}
								>
									Add password
								</Menu.Item>
							) : (
								<>
									<Menu.Item
										leftSection={<IconPassword size={18} />}
										onClick={changePassOpen}
									>
										Change password
									</Menu.Item>
									<Menu.Item
										leftSection={
											<IconShieldOff size={18} />
										}
										onClick={removePassword}
									>
										Remove password
									</Menu.Item>
									<Menu.Divider />
								</>
							)}
						</>
					)}
					<Menu.Item
						color="red"
						leftSection={<IconDoorExit size={18} />}
						onClick={leaveChatRoom}
					>
						Leave channel
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</>
	);
};

export default ChannelMenu;
