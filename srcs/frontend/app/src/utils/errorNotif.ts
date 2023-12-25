import { notifications } from "@mantine/notifications";

export const errorNotif = (err?: string) => {
	notifications.show({
		title: "Uh oh! Something went wrong.",
		message: err || "Please try again later.",
		color: "red",
		radius: "md",
		withBorder: true,
	});
};
