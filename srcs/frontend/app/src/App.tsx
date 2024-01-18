import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { Router } from "./Router";
import "./global.css";
import { theme } from "./theme";

export default function App() {
	return (
		<MantineProvider theme={theme} defaultColorScheme="auto">
			<Notifications limit={3} position="top-center" />
			<Router />
		</MantineProvider>
	);
}
