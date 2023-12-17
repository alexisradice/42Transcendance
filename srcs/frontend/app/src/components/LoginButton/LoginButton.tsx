import { Button } from "@mantine/core";

const LoginButton = () => {
	const handleLogin = async () => {
		const response = await fetch("http://localhost:3000/auth", {
			method: "GET",
			credentials: "include",
		});
		if (response.redirected) {
			window.location.href = response.url;
		}
	};
	return <Button onClick={handleLogin}>Log In</Button>;
};

export default LoginButton;
