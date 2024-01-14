import { Avatar, Group, ScrollArea } from "@mantine/core";
import { createRef, useEffect, useRef, useState } from "react";
import { Message } from "../../types";
import classes from "./MessagesArea.module.css";
import cx from "clsx";

type Props = {
	messages: Message[];
	isDM: boolean;
	login?: string;
};

const MessagesArea = ({ messages, isDM, login }: Props) => {
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
					const isSelf = message.author.login === login;
					return isDM ? (
						<Group
							key={index}
							justify={isSelf ? "flex-end" : "flex-start"}
						>
							<div
								className={cx(
									classes.bubble,
									!isSelf && classes.bubbleOthers,
									isSelf && classes.bubbleSelf,
								)}
							>
								{message.content}
							</div>
						</Group>
					) : (
						<div key={index} className={classes.messageContainer}>
							<Avatar
								src={message.author.image}
								className={classes.avatar}
							/>
							<div className={classes.messageData}>
								<div className={classes.messageInfos}>
									<p className={classes.displayName}>
										{message.author.displayName}
									</p>
									<p className={classes.messageDate}>
										{getPrettyDate(message.createdAt)}
									</p>
								</div>
								<p className={classes.messageContent}>
									{message.content}
								</p>
							</div>
						</div>
					);
				})}
			</ScrollArea>
		</div>
	);
};

export default MessagesArea;
