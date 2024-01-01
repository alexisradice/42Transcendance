export const isLoggedCookie = () => {
	return readCookie("isLogged") === "true";
};

export const jwtToken = () => {
	const jwt = readCookie("jwtToken");
	console.log("jwt", jwt);
	return jwt;
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
