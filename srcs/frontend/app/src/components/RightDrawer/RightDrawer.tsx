import { Channel } from "../../types";
import classes from "./RightDrawer.module.css";

type Props = {
	selectedChannel: Channel;
};

const RightDrawer = ({ selectedChannel }: Props) => {
	return (
		<div className={classes.RightDrawer}>
			<h1>{selectedChannel.name}</h1>
		</div>
	);
};

export default RightDrawer;
