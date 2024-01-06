import { Button, Group, Loader, Modal, PasswordInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";

type Props = {
	opened: boolean;
	close: () => void;
	onSuccess: (password: string) => void;
};

const CreateChannelModal = ({ opened, close, onSuccess }: Props) => {
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
		onSuccess(form.values.password);
		closeModal();
	};

	return (
		<Modal
			opened={opened}
			onClose={closeModal}
			title="Protected channel"
			centered
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
						rightSection={loading ? <Loader type="dots" /> : null}
					>
						Verify password and join
					</Button>
				</Group>
			</form>
		</Modal>
	);
};

export default CreateChannelModal;
