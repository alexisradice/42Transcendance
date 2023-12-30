import { Button, Center, Group, Loader, Modal } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import { useMyData } from "../../hooks/useMyData";
import { errorNotif } from "../../utils/errorNotif";
import { axiosPrivate } from "../../utils/fetcher";
import PinCodeValidator from "../PinCodeValidator/PinCodeValidator";

type Props = {
	opened: boolean;
	close: () => void;
};

const AccountSettings = ({ opened, close }: Props) => {
	const { user, error, isLoading, mutate } = useMyData();
	const [qrCode, setQrCode] = useState<string | null>(null);
	const [deactivationPinCode, setDeactivationPinCode] = useState(false);

	if (error) {
		errorNotif(error);
	}

	const twoFAGenerate = async () => {
		try {
			const response = await axiosPrivate.post("/user/twofa/generate");
			setQrCode(response.data);
		} catch (err: unknown) {
			errorNotif(err);
		}
	};

	const twoFADeactivate = async () => {
		setDeactivationPinCode(true);
	};

	const twoFAStatusChange = (notifMessage: string) => {
		close();
		notifications.show({
			title: "Success",
			message: notifMessage,
			color: "green",
			icon: <IconCheck />,
		});
		setTimeout(() => {
			mutate({ ...user });
		}, 500);
	};

	const activationSuccess = () => {
		setQrCode(null);
		twoFAStatusChange("2FA successfully activated");
	};

	const deactivationSuccess = () => {
		setDeactivationPinCode(false);
		twoFAStatusChange("2FA successfully deactivated");
	};

	return (
		<Modal
			radius="md"
			centered={true}
			opened={opened}
			onClose={() => {
				close();
				setTimeout(() => {
					setQrCode(null);
					setDeactivationPinCode(false);
				}, 500);
			}}
			title="Account Settings"
			overlayProps={{
				backgroundOpacity: 0.55,
				blur: 3,
			}}
		>
			{!error && isLoading && (
				<Center>
					<Loader />
				</Center>
			)}
			{!error && !isLoading && (
				<>
					{!qrCode && (
						<Group justify="space-between">
							{user.twoFA ? (
								<>
									<Button
										color="red"
										onClick={twoFADeactivate}
									>
										Deactivate 2FA
									</Button>
									{deactivationPinCode && (
										<PinCodeValidator
											validationUrl="/user/twofa/activate"
											enable={false}
											onSuccess={deactivationSuccess}
										/>
									)}
								</>
							) : (
								<Button color="green" onClick={twoFAGenerate}>
									Activate 2FA
								</Button>
							)}
						</Group>
					)}
					{qrCode && (
						<>
							<p>
								Step 1: Scan the QR code with your authenticator
								app (Google Authenticator, Authy, etc.)
							</p>
							<Group mt="lg" justify="center">
								<img src={qrCode} alt="QR Code" />
							</Group>
							<p>
								Step 2: Enter the 6-digit code generated by your
								app
							</p>
							<PinCodeValidator
								validationUrl="/user/twofa/activate"
								enable={true}
								onSuccess={activationSuccess}
								buttonText="Activate"
							/>
						</>
					)}
				</>
			)}
		</Modal>
	);
};

export default AccountSettings;
