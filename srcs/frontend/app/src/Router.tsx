import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MainPage } from "./pages/Main.page";
import ErrorPage from "./pages/Error.page";
import { HelloPage } from "./pages/Hello.page";

const router = createBrowserRouter([
	{
		path: "/",
		element: <MainPage />,
		errorElement: <ErrorPage />,
		children: [
			{
				path: "hello",
				element: <HelloPage />,
			},
		],
	},
]);

export function Router() {
	return <RouterProvider router={router} />;
}
