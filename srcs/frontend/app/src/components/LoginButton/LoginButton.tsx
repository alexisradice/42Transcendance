import { Button } from "@mantine/core";
import { useContext } from "react";
import { AuthContext, IAuthContext } from "react-oauth2-code-pkce";

const LoginButton = () => {
	const context = useContext<IAuthContext>(AuthContext);
	const login = () => {
		context.login();
	};
	return <Button onClick={login}>Log In</Button>;
};

export default LoginButton;
