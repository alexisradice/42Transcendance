export const isLoggedCookie = () => {
	return readCookie("isLogged") === "true";
};

export const jwtToken = () => {
	return readCookie("jwtToken");
};

const readCookie = (name: string) => {
	const cookieString = document.cookie;
	const cookies = cookieString.split("; ");

	for (const cookie of cookies) {
		const [cookieName, cookieValue] = cookie.split("=");
		if (cookieName === name) {
			return cookieValue;
		}
	}
	return null;
};
