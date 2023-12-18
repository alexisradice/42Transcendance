import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ErrorPage from "./pages/Error.page";
import { HelloPage } from "./pages/Hello.page";
import { MainPage } from "./pages/Main.page";

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
