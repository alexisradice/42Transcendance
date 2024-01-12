import { Avatar, Group, Text, ScrollArea, Stack } from "@mantine/core";
import { createRef, useEffect, useRef, useState } from "react";
import { Message } from "../../types";
import classes from "./MessagesArea.module.css";

type Props = {
	messages: Message[];
	// userLogin: string;
};

const MessagesArea = ({ messages }: Props) => {
	const viewport = useRef<HTMLDivElement>(null);
	const [, setWindowSize] = useState([0, 0]);
	const [ScrollAreaHeight, setScrollAreaHeight] = useState(0);
	const mainContainerRef = createRef<HTMLDivElement>();

	const scrollToBottom = () =>
		viewport.current?.scrollTo({
			top: viewport.current!.scrollHeight,
			behavior: "instant",
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

	const getPrettyDate = (date: string) => {
		const dateObj = new Date(date);
		const now = new Date();
		const timeString = dateObj.toLocaleTimeString(undefined, {
			hour: "2-digit",
			minute: "2-digit",
		});
		if (dateObj.setHours(0, 0, 0, 0) === now.setHours(0, 0, 0, 0)) {
			return `Today at ${timeString}`;
		}
		now.setDate(now.getDate() - 1);
		if (dateObj.setHours(0, 0, 0, 0) === now.setHours(0, 0, 0, 0)) {
			return `Yesterday at ${timeString}`;
		}
		const dayString = dateObj.toLocaleDateString(undefined, {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
		return `${dayString} ${timeString}`;
	};

	return (
		<div className={classes.mainContainer} ref={mainContainerRef}>
			<ScrollArea
				h={ScrollAreaHeight}
				type="scroll"
				viewportRef={viewport}
			>
				{messages.map((message: Message, index: number) => {
					return (
						<>
							<Group key={index} mt="xs" gap={8} wrap="nowrap">
								<Avatar
									src={message.author.image}
									style={{ alignSelf: "flex-start" }}
								/>
								<Stack gap={0} style={{ width: "100%" }}>
									<Group gap="xs" align="end">
										<Text
											size="sm"
											style={{
												overflow: "hidden",
												textOverflow: "ellipsis",
												color: "var(--mantine-color-ocean-blue-6)",
												fontSize: "0.8rem",
												// #09ADC3
												flex: 1,
											}}
										>
											{message.author.displayName}
										</Text>
										<Text
											className={classes.messageDate}
											style={{
												flexShrink: 0,
												fontSize: "0.65rem",
											}}
										>
											{getPrettyDate(message.createdAt)}
										</Text>
									</Group>
									<Text
										style={{ overflowWrap: "break-word" }}
									>
										{message.content}
									</Text>
								</Stack>
							</Group>
						</>
					);
				})}
			</ScrollArea>
		</div>
	);
};

export default MessagesArea;
