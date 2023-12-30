import { Button, FocusTrap, Group, PinInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { errorNotif } from "../../utils/errorNotif";
import { axiosPrivate } from "../../utils/fetcher";

type Props = {
	validationUrl: string;
	enable?: boolean;
	buttonText?: string;
	onSuccess?: () => void;
};

type PinCodeValidationBody = {
	pinCode: string;
	enable?: boolean;
};

const PinCodeValidator = ({
	validationUrl,
	enable,
	buttonText,
	onSuccess,
}: Props) => {
	const [loading, setLoading] = useState<boolean>(false);

	const form = useForm({
		initialValues: {
			pinCode: "",
		},
		validate: {
			pinCode: (value: string) => {
				if (/^\d{6}$/.test(value)) {
					return null;
				}
				return "Invalid PIN code";
			},
		},
	});

	const submitHandler = async (values: { pinCode: string }) => {
		setLoading(true);
		try {
			const body: PinCodeValidationBody = {
				pinCode: values.pinCode,
			};
			if (enable != null) {
				body.enable = enable;
			}
			await axiosPrivate.patch(validationUrl, body);
			setLoading(false);
			onSuccess && onSuccess();
		} catch (err: unknown) {
			setLoading(false);
			errorNotif(err);
		}
	};

	return (
		<form onSubmit={form.onSubmit(submitHandler)}>
			<Group justify="space-between" mt="md">
				<FocusTrap>
					<PinInput
						size="sm"
						length={6}
						placeholder="-"
						type="number"
						{...form.getInputProps("pinCode")}
					/>
				</FocusTrap>
				<Button type="submit" loading={loading} color="green">
					{buttonText || "Verify"}
				</Button>
			</Group>
		</form>
	);
};

export default PinCodeValidator;
