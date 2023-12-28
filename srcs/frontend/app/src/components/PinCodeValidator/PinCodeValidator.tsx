import { Group, PinInput, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { axiosPrivate } from "../../utils/fetcher";
import { errorNotif } from "../../utils/errorNotif";

type Props = {
	validationUrl: string;
	enable?: boolean;
};

type PinCodeValidationBody = {
	pinCode: string;
	enable?: boolean;
};

const PinCodeValidator = ({ validationUrl, enable }: Props) => {
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
		try {
			const body: PinCodeValidationBody = {
				pinCode: values.pinCode,
			};
			if (enable != null) {
				body.enable = enable;
			}
			await axiosPrivate.patch(validationUrl, body);
		} catch (err: unknown) {
			errorNotif(err);
		}
	};
	return (
		<form onSubmit={form.onSubmit(submitHandler)}>
			<Group justify="space-between" mt="xl">
				<PinInput
					size="sm"
					length={6}
					placeholder="-"
					type="number"
					{...form.getInputProps("pinCode")}
				/>
				<Button type="submit">Submit</Button>
			</Group>
		</form>
	);
};

export default PinCodeValidator;
