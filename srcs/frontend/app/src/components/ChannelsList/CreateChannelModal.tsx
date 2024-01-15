import {
	Button,
	Group,
	Loader,
	Modal,
	PasswordInput,
	Select,
	TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { PRIVATE, PROTECTED, PUBLIC } from "../../constants";
import { Channel, Visibility } from "../../types";
import { errorNotif } from "../../utils/errorNotif";
import { axiosPrivate } from "../../utils/fetcher";

type Props = {
	opened: boolean;
	close: () => void;
	handleChannelCreated: (channel: Channel) => void;
};

const CreateChannelModal = ({ opened, close, handleChannelCreated }: Props) => {
	const [loading, setLoading] = useState<boolean>(false);

	const form = useForm({
		initialValues: {
			channelName: "",
			visibility: PUBLIC,
			password: "",
		},
		validate: {
			channelName: (value: string) => {
				if (/^(?=.{1,50}$)[a-z]+([a-z0-9]|-)*[a-z0-9]+$/.test(value)) {
					return null;
				}
				return "Invalid channel name";
			},
			visibility: (value: Visibility) => {
				if ([PUBLIC, PROTECTED, PRIVATE].includes(value)) {
					return null;
				}
				return "Invalid visibility";
			},
			password: (value: string) => {
				if (form.values.visibility !== PROTECTED || value.length >= 8) {
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

	const createChannel = async () => {
		setLoading(true);
		try {
			const response = await axiosPrivate.post(
				"/channel/create",
				form.values,
			);
			closeModal();
			handleChannelCreated(response.data);
		} catch (err) {
			errorNotif(err);
		}
	};

	return (
		<Modal
			opened={opened}
			onClose={closeModal}
			title="Create new channel"
			centered
		>
			<form onSubmit={form.onSubmit(createChannel)}>
				<TextInput
					label="Name"
					placeholder="my-awesome-channel"
					{...form.getInputProps("channelName")}
					disabled={loading}
					data-autofocus
				/>
				<Select
					allowDeselect={false}
					label="Visibility"
					mt="md"
					data={[
						{ value: PUBLIC, label: "Public" },
						{
							value: PRIVATE,
							label: "Private",
						},
						{
							value: PROTECTED,
							label: "Protected",
						},
					]}
					onChange={(value) => {
						form.setFieldValue(
							"visibility",
							(value as Visibility) || PUBLIC,
						);
					}}
					defaultValue={PUBLIC}
				/>
				{form.values.visibility === PROTECTED && (
					<PasswordInput
						mt="md"
						label="Password"
						placeholder="Channel password"
						{...form.getInputProps("password")}
						disabled={loading}
					/>
				)}
				<Group justify="flex-end">
					<Button
						type="submit"
						color="blue"
						mt="lg"
						disabled={loading}
						rightSection={loading ? <Loader type="dots" /> : null}
					>
						Create channel
					</Button>
				</Group>
			</form>
		</Modal>
	);
};

export default CreateChannelModal;
