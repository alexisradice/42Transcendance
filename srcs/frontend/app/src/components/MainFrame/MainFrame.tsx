import { Outlet } from "react-router-dom";

const MainFrame = () => {
	// moved logic to GameSettings.page.tsx
	// this component is only for routing
	return <Outlet />;
};

export default MainFrame;
