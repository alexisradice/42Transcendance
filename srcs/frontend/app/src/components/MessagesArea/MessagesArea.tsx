import { Avatar, Button, Group, ScrollArea } from "@mantine/core";
import cx from "clsx";
import Linkify from "linkify-react";
import { createRef, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { validate as uuidValidate } from "uuid";
import { useSocketContext } from "../../context/useContextGameSocket";
import { Message, SocketResponse } from "../../types";
import classes from "./MessagesArea.module.css";
import { errorNotif } from "../../utils/errorNotif";

type Props = {
	messages: Message[];
	isDM: boolean;
	login?: string;
};

const MessagesArea = ({ messages, isDM, login }: Props) => {
	const { gameSocket } = useSocketContext();
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

	const renderLink = ({ attributes, content }: any) => {
		const { href, ...props } = attributes;
		const messageURL = new URL(href);
		const appURL = new URL(window.location.href);

		const isSameSite = messageURL.host === appURL.host;
		const pathParts = messageURL.pathname.split("/");
		const isGameURL = pathParts[1] === "game";
		const lobbyId = pathParts[2];
		const isCodeValid = uuidValidate(lobbyId || "");

		const isInviteLink = isSameSite && isGameURL && isCodeValid;

		if (isInviteLink) {
			return (
				<Button
					onClick={() => {
						gameSocket.emit(
							"join-lobby",
							{ lobbyId },
							(response: SocketResponse<undefined>) => {
								if (response.error) {
									const err = new Error();
									Object.assign(err, response.error);
									errorNotif(err);
								}
							},
						);
					}}
					className={classes.gameInviteButton}
				>
					Accept invitation
				</Button>
			);
		} else {
			return (
				<Link to={href} {...props}>
					{content}
				</Link>
			);
		}
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
									classes.messageContent,
									!isSelf && classes.bubbleOthers,
									isSelf && classes.bubbleSelf,
								)}
							>
								<Linkify options={{ render: renderLink }}>
									{message.content}
								</Linkify>
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
									<Linkify options={{ render: renderLink }}>
										{message.content}
									</Linkify>
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
