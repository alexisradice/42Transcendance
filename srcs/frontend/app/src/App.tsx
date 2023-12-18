import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { AuthProvider } from "react-oauth2-code-pkce";
import { Router } from "./Router";
import { theme } from "./theme";
import { authConfig } from "./utils/AuthConfig";

export default function App() {
	// const postLogin = () => {
	// 	fetch(`${import.meta.env.VITE_API_URL}/auth`, {
	// 		method: "POST",
	// 		headers: {
	// 			"Content-Type": "application/json",
	// 			"Authorization": `Bearer ${context.token}`,
	// 		},
	// 	})
	// 		.then((response: Response) => {
	// 			if (!response.ok) {
	// 				throw new HttpException(
	// 					response.statusText,
	// 					response.status,
	// 				);
	// 			}
	// 			return response.json();
	// 		})
	// 		.then((json: { jwtToken: string }) => {
	// 			localStorage.setItem("JWT_token", json.jwtToken);
	// 		})
	// 		.catch((err: HttpException) => {
	// 			notifications.show({
	// 				title: "Uh oh! Something went wrong.",
	// 				message: prettyErrors(err.status),
	// 				color: "red",
	// 				radius: "md",
	// 				withBorder: true,
	// 			});
	// 		});
	// };

	return (
		<AuthProvider authConfig={authConfig}>
			<MantineProvider theme={theme} defaultColorScheme="auto">
				<Notifications limit={3} position="top-center" />
				<Router />
			</MantineProvider>
		</AuthProvider>
	);
}
