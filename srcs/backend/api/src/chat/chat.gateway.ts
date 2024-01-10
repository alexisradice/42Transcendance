import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from "@nestjs/websockets";
import { User } from "@prisma/client";
import * as argon2 from "argon2";
import { Server, Socket } from "socket.io";
import { ChannelService } from "src/channel/channel.service";
import { SocketResponse } from "src/types";
import { UserService } from "src/user/user.service";
import { ChatService } from "./chat.service";

@WebSocketGateway({
	cors: {
		origin: "http://localhost:5173",
		credentials: true,
	},
	namespace: "chat",
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	private clients: Map<string, Socket> = new Map();
	constructor(
		private jwtService: JwtService,
		private configService: ConfigService,
		private userService: UserService,
		private channelService: ChannelService,
		private chatService: ChatService,
	) {}

	extractCookie = (cookieString: string, key: string) => {
		if (!cookieString) return null;
		const cookies = cookieString.split("; ");
		for (const cookie of cookies) {
			const [cookieName, cookieValue] = cookie.split("=");
			if (cookieName === key) {
				return cookieValue;
			}
		}
		return null;
	};

	userFromRefreshToken = async (refreshToken: string) => {
		const payload = await this.jwtService.verifyAsync(refreshToken, {
			secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
		});
		const user = await this.userService.findOne({ login: payload.sub });
		if (!user || !user.refreshToken)
			throw new UnauthorizedException("Access Denied");
		const refreshTokenMatches = await argon2.verify(
			user.refreshToken,
			refreshToken,
		);
		if (!refreshTokenMatches) {
			throw new ForbiddenException("Access Denied");
		}
		return user;
	};

	@WebSocketServer()
	server: Server;

	async handleConnection(client: Socket) {
		console.log("connected to chat");
		const jwtToken = this.extractCookie(
			client.handshake.headers.cookie,
			"jwtToken",
		);
		const refreshToken = this.extractCookie(
			client.handshake.headers.cookie,
			"jwtRefreshToken",
		);
		if (!jwtToken) {
			if (!refreshToken) {
				console.error(new UnauthorizedException("No token provided"));
				client.disconnect();
			}
			try {
				const user = await this.userFromRefreshToken(refreshToken);
				client.data.user = user;
				this.clients.set(user.id, client);
				client.join(user.id);
			} catch (err) {
				console.error(err);
				client.disconnect();
			}
		} else {
			try {
				const user = await this.jwtService.verifyAsync(jwtToken, {
					secret: this.configService.get<string>("JWT_SECRET"),
				});
				const dbUser = await this.userService.findOne({
					login: user.sub,
				});
				client.data.user = dbUser;
				this.clients.set(dbUser.id, client);
				client.join(dbUser.id);
			} catch (err) {
				console.error(err);
				client.disconnect();
			}
		}
	}

	async handleDisconnect(client: any) {
		console.log("client disconnected");
		const user: User = client.data.user;
		this.clients?.delete(user.id);
	}

	@SubscribeMessage("join-chatroom")
	async handleJoinChatroom(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: { channelId: string; password?: string },
	): Promise<SocketResponse> {
		const response = { success: false, error: null };
		const { channelId, password } = payload;
		const user: User = client.data.user;
		try {
			const channel =
				await this.channelService.findChannelById(channelId);
			const isUserInChannel = await this.channelService.isChannelMember(
				user.id,
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
				this.server.to(channelId).emit("user-joined", channelId);
				response.success = true;
			} else {
				response.error = new ForbiddenException("Access Denied");
			}
			return response;
		} catch (err) {
			console.error(err);
			response.error = err;
			return response;
		}
	}

	@SubscribeMessage("leave-chatroom")
	async handleLeaveChatroom(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: { channelId: string },
	): Promise<SocketResponse> {
		const response = { success: false, error: null };
		const { channelId } = payload;
		const user: User = client.data.user;
		let wasAlone = false;
		try {
			const channel =
				await this.channelService.findChannelById(channelId);
			const isOwner = await this.channelService.isChannelOwner(
				user.id,
				channel,
			);
			if (isOwner) {
				wasAlone = await this.channelService.changeOwnership(channel);
			}
			//leave channel in db
			await this.channelService.removeUserFromChannel(user, channelId);
			console.log(
				"User removed from channel, socket leaving " + channelId,
			);
			if (wasAlone) {
				await this.channelService.destroyChannel(channelId);
				this.server.emit("channel-destroyed");
			}
			//leave channel socket room
			client.leave(channelId);
			response.success = true;
			this.server.to(channelId).emit("user-left", channelId);
		} catch (err) {
			console.error(err);
			response.error = err;
		} finally {
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
			error: null,
		};
		const { channelId, content } = payload;
		const author: User = client.data.user;
		console.log('received message "' + content + '"');
		console.log('sending to room "' + channelId + '"');
		try {
			const isUserInChannel = await this.channelService.isChannelMember(
				author.id,
				channelId,
			);
			if (!isUserInChannel) {
				throw new ForbiddenException(
					"You can't send a message in this room.",
				);
			}
			const isUserMuted = await this.channelService.isMuted(
				author.id,
				channelId,
			);
			if (isUserMuted) {
				throw new ForbiddenException(
					"You can't send a message in this room.",
				);
			}
			const message = await this.chatService.createMessage(
				channelId,
				author.id,
				content,
			);
			const newMessage = {
				id: message.id,
				createdAt: message.createdAt,
				content: message.content,
				author: {
					login: author.login,
					displayName: author.displayName,
					image: author.image,
				},
			};
			this.server.to(channelId).emit("display-message", channelId);
			response.success = true;
			response.payload = newMessage;
		} catch (err) {
			console.error(err);
			response.error = err;
		} finally {
			return response;
		}
	}

	@SubscribeMessage("eject-member")
	async ejectMember(
		@ConnectedSocket() client: Socket,
		@MessageBody()
		payload: {
			channelId: string;
			kickedId: string;
			action: "kick" | "ban";
		},
	): Promise<SocketResponse> {
		const response: SocketResponse = {
			success: false,
			error: null,
		};
		const { channelId, kickedId, action } = payload;
		const user: User = client.data.user;
		try {
			const channel =
				await this.channelService.findChannelById(channelId);
			const canEject = await this.channelService.hasRights(
				user.id,
				kickedId,
				channel,
				action,
			);
			if (canEject) {
				if (action === "kick") {
					await this.channelService.kickUser(kickedId, channelId);
				} else if (action === "ban") {
					await this.channelService.banUser(kickedId, channelId);
				}
				const kickedClient = this.clients.get(kickedId);
				this.server.to(kickedId).emit("user-kicked", {
					action,
					channelName: channel.name,
				});
				kickedClient.leave(channelId);
				response.success = true;
			}
		} catch (err) {
			console.error(err);
			response.error = err;
		} finally {
			return response;
		}
	}
}
