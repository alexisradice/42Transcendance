import { Button, Group } from "@mantine/core";
import PinCodeValidator from "../PinCodeValidator/PinCodeValidator";
import { errorNotif } from "../../utils/errorNotif";
import { axiosPrivate } from "../../utils/fetcher";
import { useState } from "react";
import { User } from "../../types";

type Props = {
	user: User;
};

const TwoFaActivation = ({ user }: Props) => {
	const [qrCode, setQrCode] = useState<string>("");
	const twoFAGenerate = async () => {
		try {
			const response = await axiosPrivate.post("/user/twofa/generate");
			setQrCode(response.data);
		} catch (err: unknown) {
			errorNotif(err);
		}
	};
	return (
		<>
			<Group justify="space-between" mt="lg">
				{user.twoFA ? (
					<Button color="red.8" onClick={twoFAGenerate}>
						Deactivate 2FA
					</Button>
				) : (
					<Button color="green" onClick={twoFAGenerate}>
						Activate 2FA
					</Button>
				)}
			</Group>
			{qrCode && (
				<>
					<p>
						Step 1: Scan the QR code with your authenticator app
						(Google Authenticator, Authy, etc.)
					</p>
					<Group mt="lg" justify="center">
						<img src={qrCode} alt="QR Code" />
					</Group>

					<p>Step 2: Enter the 6-digit code generated by your app</p>
					<PinCodeValidator
						validationUrl="/user/twofa/activate"
						enable={true}
					/>
				</>
			)}
		</>
	);
};

export default TwoFaActivation;
