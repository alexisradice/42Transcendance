import { TextInput, FileInput, rem, Group, Button } from "@mantine/core";
import { IconPhotoUp } from "@tabler/icons-react";
import { errorNotif } from "../../utils/errorNotif";
import { axiosPrivate } from "../../utils/fetcher";
import { useMyData } from "../../hooks/useMyData";
import { useForm } from "@mantine/form";

type Props = {
	closeModal: () => void;
};

type FormValues = {
	displayName: string;
	image: string | Blob | null;
};

const ProfileForm = ({ closeModal }: Props) => {
	const { user, error, isLoading, mutate } = useMyData();

	const form = useForm<FormValues>({
		initialValues: {
			displayName: "",
			image: null,
		},
		validate: {
			displayName: (value: string) => {
				if (/^(\w{3,20})?$/.test(value)) {
					return null;
				}
				return "Usernames should be between 3-20 characters, and only contain alphanumeric characters or _";
			},
			image: (value: unknown) => {
				if (!value) {
					return null;
				}
				if (value instanceof File) {
					if (!["image/png", "image/jpeg"].includes(value.type)) {
						return "Only png and jpeg files are allowed";
					}
					if (value.size > 5_000_000) {
						return "File size should be less than 5MB";
					}
					return null;
				}
				return "Invalid file";
			},
		},
	});

	const submitHandler = async (values: FormValues) => {
		try {
			const formData = new FormData();

			formData.append("displayName", values.displayName);
			formData.append("image", values.image || "");

			await axiosPrivate.patch("/user/update", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			mutate({
				...user,
			});

			closeModal();
			form.reset();
		} catch (err: unknown) {
			errorNotif(err);
		}
	};

	return (
		<>
			{!error && !isLoading && (
				<form onSubmit={form.onSubmit(submitHandler)}>
					<TextInput
						label="Change display name"
						radius="md"
						placeholder={user.displayName || ""}
						{...form.getInputProps("displayName")}
					/>
					<FileInput
						mt="md"
						accept="image/png,image/jpeg"
						label="New profile picture"
						leftSection={
							<IconPhotoUp
								style={{ width: rem(18), height: rem(18) }}
								stroke={1.5}
							/>
						}
						clearable
						// @ts-expect-error - Mantine types are missing the placeholder prop
						placeholder="Click here to select a file"
						{...form.getInputProps("image")}
					/>
					<Group justify="flex-end" mt="lg">
						<Button disabled={!form.isDirty()} type="submit">
							Submit
						</Button>
					</Group>
				</form>
			)}
		</>
	);
};

export default ProfileForm;
