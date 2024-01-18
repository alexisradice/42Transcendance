import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ErrorPage from "./pages/Error.page";
import { GamePage } from "./pages/Game.page";
import { MainPage } from "./pages/Main.page";
import GameSettings from "./pages/GameSettings.page";

const router = createBrowserRouter([
	{
		path: "/",
		element: <MainPage />,
		errorElement: <ErrorPage />,
		children: [
			{
				path: "",
				element: <GameSettings />,
			},
			{
				path: "game",
				element: <GamePage />,
			},
		],
	},
]);

export function Router() {
	return <RouterProvider router={router} />;
}
