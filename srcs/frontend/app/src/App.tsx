import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { Notifications, notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { AuthProvider } from "react-oauth2-code-pkce";
import { AuthConfig } from "./AuthConfig";
import { Router } from "./Router";
import { theme } from "./theme";
import { HttpException } from "./utils/HttpException";
import { prettyErrors } from "./utils/PrettyErrors";

export default function App() {
	const postLogin = () => {
		const accessToken = localStorage
			.getItem("ROCP_token")
			?.replace(/"/g, "");
		fetch(`${import.meta.env.VITE_API_URL}/auth`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${accessToken}`,
			},
		})
			.then((response: Response) => {
				if (!response.ok) {
					throw new HttpException(
						response.statusText,
						response.status,
					);
				}
				return response.json();
			})
			.then((json: { jwtToken: string }) => {
				localStorage.setItem("JWT_token", json.jwtToken);
			})
			.catch((err: HttpException) => {
				notifications.show({
					title: "Uh oh! Something went wrong.",
					message: prettyErrors(err.status),
					color: "red",
					radius: "md",
					withBorder: true,
				});
			});
	};

	return (
		<AuthProvider authConfig={AuthConfig(postLogin)}>
			<MantineProvider theme={theme} defaultColorScheme="auto">
				<Notifications limit={3} position="top-center" />
				<Router />
			</MantineProvider>
		</AuthProvider>
	);
}
