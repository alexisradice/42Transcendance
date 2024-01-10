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
	// changePassword: () => void;
	removePassword: () => Promise<void>;
};

const ChannelMenu = ({
	isOwner,
	hasPassword,
	addPassword,
	removePassword,
}: Props) => {
	const [opened, { open, close }] = useDisclosure(false);
	const [loading, setLoading] = useState<boolean>(false);

	const form = useForm({
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

	const closeModal = () => {
		close();
		setLoading(false);
		form.reset();
	};

	const handleSubmit = async () => {
		addPassword(form.values.password);
		closeModal();
	};

	return (
		<>
			<Modal
				radius="md"
				centered={true}
				opened={opened}
				onClose={closeModal}
				title="Add password"
				overlayProps={{
					backgroundOpacity: 0.55,
					blur: 3,
				}}
			>
				<form onSubmit={form.onSubmit(handleSubmit)}>
					<PasswordInput
						mt="md"
						label="Password"
						placeholder="Channel password"
						{...form.getInputProps("password")}
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
					>
						Leave channel
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</>
	);
};

export default ChannelMenu;
