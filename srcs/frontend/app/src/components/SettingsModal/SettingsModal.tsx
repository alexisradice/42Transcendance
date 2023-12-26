import { Button, Group, Loader, Modal, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { errorNotif } from "../../utils/errorNotif";
import { axiosPrivate } from "../../utils/fetcher";
import { useMyData } from "../../hooks/useMyData";

type Props = {
	opened: boolean;
	close: () => void;
};

const SettingsModal = ({ opened, close }: Props) => {
	const { user, error, isLoading, mutate } = useMyData();

	const form = useForm({
		initialValues: {
			displayName: "",
		},
		validate: {
			displayName: (value) =>
				/^(\w{3,20})?$/.test(value)
					? null
					: "Usernames should be between 3-20 characters, and only contain alphanumeric characters or _",
		},
	});

	return (
		<Modal
			radius="md"
			centered={true}
			opened={opened}
			onClose={close}
			title="Settings"
			overlayProps={{
				backgroundOpacity: 0.55,
				blur: 3,
			}}
		>
			{error && <></>}
			{!error && isLoading && <Loader></Loader>}
			{!error && !isLoading && (
				<form
					onSubmit={form.onSubmit(async (values) => {
						console.log("values", values);
						try {
							await axiosPrivate.patch("/user/update", values);
							mutate({
								...user,
								displayName: values.displayName,
							});
							close();
						} catch (err: unknown) {
							errorNotif(err);
						}
					})}
				>
					<TextInput
						label="Change your username"
						radius="md"
						placeholder={user.displayName || ""}
						{...form.getInputProps("displayName")}
					/>
					{/* <Switch
					mt="md"
					label="Activate Two-factor authentication (2FA)"
					{...form.getInputProps("twofa")}
					checked={data?.twofa}
				/> */}
					<Group justify="flex-end" mt="md">
						<Button disabled={!form.isDirty()} type="submit">
							Submit
						</Button>
					</Group>
				</form>
			)}
		</Modal>
	);
};

export default SettingsModal;
