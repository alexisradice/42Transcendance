import { notifications } from "@mantine/notifications";
import { AxiosError } from "axios";
import { prettyErrors } from "./prettyErrors";

export const errorNotif = (error: unknown) => {
	let message = "Please try again later.";
	if (error instanceof AxiosError) {
		message =
			error.response?.data.message ||
			prettyErrors(error.response?.status || 500);
	} else if (error instanceof Error) {
		message = error.message;
	}
	notifications.show({
		title: "Uh oh! Something went wrong.",
		message: message,
		color: "red",
		radius: "md",
		withBorder: true,
	});
};
