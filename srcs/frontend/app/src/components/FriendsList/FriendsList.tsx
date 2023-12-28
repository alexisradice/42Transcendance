import { ScrollArea } from "@mantine/core";
import classes from "./FriendsList.module.css";

type Props = {
	height: number;
};

const FriendsList = ({ height }: Props) => {
	return (
		<ScrollArea h={height}>
			<ul className={classes.list}>
				<li>#general</li>
				<li>#trucs</li>
				<li>#blabla</li>
				<li>#ceci-est-un-tres-tres-tres-long-nom-de-chan</li>
			</ul>
		</ScrollArea>
	);
};

export default FriendsList;
