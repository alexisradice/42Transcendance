import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChannelService } from "src/channel/channel.service";
import { UserService } from "src/user/user.service";
import { ChatService } from "./chat.service";
import { Message } from "@prisma/client";
import { SocketResponse } from "src/types";
import { response } from "express";

@WebSocketGateway({
	cors: {
		origin: "http://localhost:5173",
	},
	namespace: "chat",
})
export class ChatGateway implements OnGatewayConnection {
	constructor(
		private jwtService: JwtService,
		private configService: ConfigService,
		private userService: UserService,
		private channelService: ChannelService,
		private chatService: ChatService,
	) {}

	@WebSocketServer()
	server: Server;

	async handleConnection(client: Socket) {
		console.log("connected to chat");
		const jwtToken = client.handshake.query.token;
		const token = Array.isArray(jwtToken) ? jwtToken[0] : jwtToken;
		try {
			const user = this.jwtService.verify(token, {
				secret: this.configService.get<string>("JWT_SECRET"),
			});
			if (!user) {
				client.disconnect();
			}
			const dbUser = await this.userService.findOne({ login: user.sub });
			client.data.user = dbUser;
		} catch (e) {
			console.error(e);
			client.disconnect();
		}
	}

	@SubscribeMessage("join-chatroom")
	async handleJoinChatroom(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: { channelId: string; password?: string },
	): Promise<SocketResponse> {
		const response = { success: false, error: "" };
		const { channelId, password } = payload;
		const user = client.data.user;
		try {
			const channel =
				await this.channelService.findChannelById(channelId);
			const isUserInChannel = await this.channelService.isChannelMember(
				user,
				channelId,
			);
			// user was already in channel = no further checks
			if (isUserInChannel) {
				console.log(
					"User already in channel, socket joining " + channelId,
				);
				client.join(channelId);
				response.success = true;
				return response;
			}
			// check if user allowed to enter channel
			const isAllowedInChannel =
				await this.channelService.checkPermissions(
					user,
					channel,
					password,
				);
			if (isAllowedInChannel) {
				await this.channelService.addUserToChannel(user, channelId);
				console.log(
					"User added in channel, socket joining " + channelId,
				);
				client.join(channelId);
				response.success = true;
			}
			return response;
		} catch (err) {
			response.error = err;
			return response;
		}
	}

	@SubscribeMessage("send-message")
	async handleMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: { channelId: string; content: string },
	): Promise<SocketResponse> {
		const response: SocketResponse = {
			success: false,
			error: "",
		};
		const { channelId, content } = payload;
		const author = client.data.user;
		console.log('received message "' + content + '"');
		console.log('sending to room "' + channelId + '"');
		try {
			const isUserInChannel = await this.channelService.isChannelMember(
				author,
				channelId,
			);
			// TODO: check if user isnt muted
			if (isUserInChannel) {
				const message = await this.chatService.createMessage(
					channelId,
					author.id,
					content,
				);
				return {
					success: true,
					error: "",
					payload: {
						id: message.id,
						createdAt: message.createdAt,
						content: message.content,
						author: {
							login: author.login,
							displayName: author.displayName,
							image: author.image,
						},
					},
				};
			}
		} catch (err) {
			console.error(err);
			response.error = err;
			return response;
		}
	}
}
