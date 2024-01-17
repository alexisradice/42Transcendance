import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { Router } from "./Router";
import "./global.css";
import { theme } from "./theme";
import { SocketProvider } from "./context/SocketContext";

export default function App() {
    return (
        <SocketProvider>
            <MantineProvider theme={theme} defaultColorScheme="auto">
                <Notifications limit={3} position="top-center" />
                <Router />
            </MantineProvider>
        </SocketProvider>
    );
}
