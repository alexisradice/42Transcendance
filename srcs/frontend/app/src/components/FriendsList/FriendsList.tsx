import { ScrollArea } from "@mantine/core";
import classes from "./FriendsList.module.css";

type Props = {
	height: number;
};

const FriendsList = ({ height }: Props) => {
	return (
		<ScrollArea h={height}>
			<ul className={classes.list}></ul>
		</ScrollArea>
	);
};

export default FriendsList;
