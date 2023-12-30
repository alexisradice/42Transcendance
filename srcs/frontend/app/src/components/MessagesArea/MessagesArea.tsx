import { Center, Loader, ScrollArea } from "@mantine/core";
import { useMyData } from "../../hooks/useMyData";
import { Message } from "../../types";
import classes from "./MessagesArea.module.css";
import { createRef, useEffect, useState } from "react";

type Props = {
	messages: Message[];
};

const MessagesArea = ({ messages }: Props) => {
	const { user, error, isLoading } = useMyData();
	const [ScrollAreaHeight, setScrollAreaHeight] = useState(0);
	const mainContainerRef = createRef<HTMLDivElement>();

	useEffect(() => {
		if (mainContainerRef.current) {
			setScrollAreaHeight(mainContainerRef.current?.clientHeight);
		}
	}, [mainContainerRef]);

	return (
		<div className={classes.mainContainer} ref={mainContainerRef}>
			{!error && isLoading && (
				<Center>
					<Loader type="dots" />
				</Center>
			)}
			{!error && !isLoading && (
				<ScrollArea h={ScrollAreaHeight}>
					{messages.map((message: Message, index: number) => {
						if (message.author === user.login) {
							return (
								<div
									key={index}
									className={classes.messageBubbleSelf}
								>
									{message.content}
								</div>
							);
						} else {
							return (
								<div
									key={index}
									className={classes.messageBubble}
								>
									{message.content}
								</div>
							);
						}
					})}
				</ScrollArea>
			)}
		</div>
	);
};

export default MessagesArea;
