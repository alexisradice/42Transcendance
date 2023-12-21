import { Button, Group, Modal } from "@mantine/core";
import { useEffect } from "react";
import axios from "../../utils/axios";
import { notifications } from "@mantine/notifications";

const LoginModal = () => {
	useEffect(() => {
		let isMounted = true;
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get("code");
		const controller = new AbortController();
		const getJwtTokens = async () => {
			try {
				const response = await axios.post(
					"/auth/login",
					{ code },
					{ signal: controller.signal, withCredentials: true },
				);
				localStorage.setItem("token", response.data);
				isMounted && console.log(response.data);
			} catch (err) {
				if (err) {
					notifications.show({
						title: "Uh oh! Something went wrong.",
						message: "Please try again later.",
						color: "red",
						radius: "md",
						withBorder: true,
					});
				}
			}
		};

		if (code) {
			getJwtTokens();
			window.history.replaceState(null, "", window.location.pathname);
		}

		return () => {
			isMounted = false;
			controller.abort();
		};
	}, []);

	const login = () => {
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
				backgroundOpacity: 0.55,
				blur: 8,
			}}
		>
			<Group justify="center">
				<span>Hey! You must be logged in to use this site.</span>
				<Button fullWidth={true} onClick={login}>
					Login with your 42 account
				</Button>
			</Group>
		</Modal>
	);
};

export default LoginModal;
