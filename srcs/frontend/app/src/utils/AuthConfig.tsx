import { TAuthConfig, TRefreshTokenExpiredEvent } from "react-oauth2-code-pkce";

export const authConfig: TAuthConfig = {
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
	onRefreshTokenExpire: (event: TRefreshTokenExpiredEvent) =>
		window.confirm(
			"Session expired. Refresh page to continue using the site?",
		) && event.login(),
};
