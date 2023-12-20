import { Button, Group, Modal } from "@mantine/core";
// import { notifications } from "@mantine/notifications";

const LoginModal = () => {
	// if (error) {
	// 	notifications.show({
	// 		title: "Uh oh! Something went wrong.",
	// 		message: error,
	// 		color: "red",
	// 		radius: "md",
	// 		withBorder: true,
	// 	});
	// }
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
						// TODO login();
					}}
				>
					Login with your 42 account
				</Button>
			</Group>
		</Modal>
	);
};

export default LoginModal;
