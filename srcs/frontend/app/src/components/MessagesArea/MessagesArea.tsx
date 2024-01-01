import { Center, Group, Loader, Paper, ScrollArea } from "@mantine/core";
import { createRef, useEffect, useRef, useState } from "react";
import { useMyData } from "../../hooks/useMyData";
import { Message } from "../../types";
import classes from "./MessagesArea.module.css";

type Props = {
	messages: Message[];
};

const MessagesArea = ({ messages }: Props) => {
	const viewport = useRef<HTMLDivElement>(null);
	const [, setWindowSize] = useState([0, 0]);
	const { user, error, isLoading } = useMyData();
	const [ScrollAreaHeight, setScrollAreaHeight] = useState(0);
	const mainContainerRef = createRef<HTMLDivElement>();

	const scrollToBottom = () =>
		viewport.current!.scrollTo({
			top: viewport.current!.scrollHeight,
			behavior: "smooth",
		});

	useEffect(() => {
		const updateSize = () => {
			setWindowSize([window.innerWidth, window.innerHeight]);
		};
		window.addEventListener("resize", updateSize);
		return () => {
			window.removeEventListener("resize", updateSize);
		};
	}, []);

	useEffect(() => {
		if (mainContainerRef.current) {
			setScrollAreaHeight(mainContainerRef.current?.clientHeight);
			scrollToBottom();
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
				<>
					<ScrollArea
						h={ScrollAreaHeight}
						type="scroll"
						viewportRef={viewport}
					>
						{messages.map((message: Message, index: number) => {
							const isSelf = message.author === user.login;
							return (
								<Group
									key={index}
									justify={isSelf ? "flex-end" : "flex-start"}
								>
									<Paper
										className={
											isSelf
												? classes.messageBubbleSelf
												: ""
										}
										radius="lg"
										shadow="md"
										p="sm"
										mt="md"
										withBorder
									>
										{message.content}
									</Paper>
								</Group>
							);
						})}
					</ScrollArea>
				</>
			)}
		</div>
	);
};

export default MessagesArea;
