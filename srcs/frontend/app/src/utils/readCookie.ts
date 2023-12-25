export const isLoggedCookie = () => {
	const cookieString = document.cookie;
	const cookies = cookieString.split("; ");

	for (const cookie of cookies) {
		const [cookieName, cookieValue] = cookie.split("=");
		if (cookieName === "isLogged" && cookieValue === "true") {
			return true;
		}
	}

	return false;
};
