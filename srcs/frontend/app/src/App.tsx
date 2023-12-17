import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import {
	AuthProvider,
	TAuthConfig,
	TRefreshTokenExpiredEvent,
} from "react-oauth2-code-pkce";
import { Router } from "./Router";
import { theme } from "./theme";

const authConfig: TAuthConfig = {
	clientId: import.meta.env.VITE_CLIENT_ID,
	authorizationEndpoint: "https://api.intra.42.fr/oauth/authorize",
	tokenEndpoint: "https://api.intra.42.fr/oauth/token",
	redirectUri: import.meta.env.VITE_REDIRECT_URI,
	autoLogin: false,
	decodeToken: false,
	extraTokenParameters: {
		client_secret: import.meta.env.VITE_CLIENT_SECRET,
	},
	scope: "public",
	postLogin: () => {
		fetch(`${import.meta.env.VITE_API_URL}/auth`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ token: localStorage.getItem("ROCP_token") }),
		})
			.then((response: Response) => {
				return response.json();
			})
			.then((json: { token: string }) => {
				localStorage.setItem("JWT_token", json.token);
			})
			.catch((err: Error) => {
				console.error(err);
			});
	},
	onRefreshTokenExpire: (event: TRefreshTokenExpiredEvent) =>
		window.confirm(
			"Session expired. Refresh page to continue using the site?",
		) && event.login(),
};

export default function App() {
	return (
		<AuthProvider authConfig={authConfig}>
			<MantineProvider theme={theme} defaultColorScheme="auto">
				<Router />
			</MantineProvider>
		</AuthProvider>
	);
}
