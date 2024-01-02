import { Button, Group, Modal } from "@mantine/core";
import { useEffect, useState } from "react";
import { axiosPrivate } from "../../utils/fetcher";
import { errorNotif } from "../../utils/errorNotif";
import PinCodeValidator from "../PinCodeValidator/PinCodeValidator";

type Props = {
	setIsLogged: (isLogged: boolean) => void;
};

const LoginModal = ({ setIsLogged }: Props) => {
	const [needsTwoFA, setNeedsTwoFA] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		let isMounted = true;
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get("code");
		const controller = new AbortController();
		const callLogin = async () => {
			try {
				const response = await axiosPrivate.post(
					"/auth/login",
					{ code },
					{ signal: controller.signal },
				);
				if (!response.data.success && response.data.needsTwoFA) {
					setNeedsTwoFA(true);
					return;
				}
				isMounted && setIsLogged(true);
			} catch (err: unknown) {
				setIsLoading(false);
				errorNotif(err);
			}
		};

		if (code) {
			setIsLoading(true);
			callLogin();
			window.history.replaceState(null, "", window.location.pathname);
		}

		return () => {
			isMounted = false;
			controller.abort();
		};
	}, [setIsLogged]);

	const login = () => {
		setIsLoading(true);
		const params = new URLSearchParams({
			response_type: "code",
			client_id: import.meta.env.VITE_CLIENT_ID,
			redirect_uri: import.meta.env.VITE_REDIRECT_URI,
		});
		window.location.replace(
			`${import.meta.env.VITE_42_AUTH_URL}?${params.toString()}`,
		);
	};

	return (
		<Modal
			centered
			opened={true}
			withCloseButton={false}
			onClose={() => {}}
			overlayProps={{
				backgroundOpacity: 1,
			}}
		>
			{needsTwoFA ? (
				<>
					<span>Please enter your authenticator code.</span>
					<PinCodeValidator
						validationUrl="/auth/login"
						onSuccess={() => setIsLogged(true)}
					/>
				</>
			) : (
				<Group justify="center">
					<span>Hey! You must be logged in to use this site.</span>
					<Button
						fullWidth={true}
						onClick={login}
						loading={isLoading}
						loaderProps={{ type: "dots" }}
					>
						Login with your 42 account
					</Button>
				</Group>
			)}
		</Modal>
	);
};

export default LoginModal;
