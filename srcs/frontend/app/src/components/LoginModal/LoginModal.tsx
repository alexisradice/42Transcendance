import { Button, Group, Modal } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useContext } from "react";
import { AuthContext, IAuthContext } from "react-oauth2-code-pkce";

const LoginModal = () => {
	const { error, login } = useContext<IAuthContext>(AuthContext);
	if (error) {
		notifications.show({
			title: "Uh oh! Something went wrong.",
			message: error,
			color: "red",
			radius: "md",
			withBorder: true,
		});
	}
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
				<Button
					fullWidth={true}
					onClick={() => {
						login();
					}}
				>
					Login with your 42 account
				</Button>
			</Group>
		</Modal>
	);
};

export default LoginModal;
