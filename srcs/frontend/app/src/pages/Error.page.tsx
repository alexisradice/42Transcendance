import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import ErrorDisplay from "../components/ErrorDisplay/ErrorDisplay";

const ErrorPage = () => {
	const error = useRouteError();
	let status: { code: number; text: string } | undefined = undefined;
	let message = undefined;

	if (typeof error === "string") {
		message = error;
	} else if (error instanceof Error) {
		message = error.message;
	} else if (isRouteErrorResponse(error)) {
		status = {
			code: error.status,
			text: error.statusText,
		};
		message = error.data?.message;
	}

	return <ErrorDisplay message={message} status={status} />;
};

export default ErrorPage;
