export const prettyErrors = (status: number | string) => {
	let statusString = "";
	if (typeof status === "number") {
		statusString = status.toString();
	} else {
		statusString = status;
	}
	switch (statusString) {
		case "400":
			return "The request was malformed.";
		case "401":
			return "You are not authorized to access this resource.";
		case "403":
			return "You are not allowed to access this resource.";
		case "404":
			return "The resource you are trying to access does not exist.";
		case "429":
			return "Too many requests. Please slow down.";
		case "500":
			return "An internal server error occurred.";
		case "502":
			return "The server is currently down. Please try again later.";
		case "503":
			return "The server is currently unavailable. Please try again later.";
		default:
			return "An unknown error occurred.";
	}
};
