import {
	BadRequestException,
	ForbiddenException,
	HttpException,
	UnauthorizedException,
} from "@nestjs/common";
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
import { Status, User } from "@prisma/client";
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
	connectionStateRecovery: {
		maxDisconnectionDuration: 2 * 60 * 1000,
		skipMiddlewares: true,
	},
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	private clients: Map<string, Socket> = new Map();
	private selectedChannelClients: Map<string, string> = new Map();

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
		if (client.recovered) {
			const user = client.data.user;
			this.clients.set(user.id, client);
			this.userService.updateStatus(user.login, Status.ONLINE);
			this.server.emit("status-changed", {
				login: user.login,
				status: Status.ONLINE,
			});
			return;
		}
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
				client.disconnect();
			}
			try {
				const user = await this.userFromRefreshToken(refreshToken);
				client.data.user = user;
				this.clients.set(user.id, client);
				client.join(user.id);
				this.userService.updateStatus(user.login, Status.ONLINE);
				this.server.emit("status-changed", {
					login: user.login,
					status: Status.ONLINE,
				});
			} catch (err) {
				client.disconnect();
			}
		} else {
			try {
				const tokenData = await this.jwtService.verifyAsync(jwtToken, {
					secret: this.configService.get<string>("JWT_SECRET"),
				});
				const user = await this.userService.findOne({
					login: tokenData.sub,
				});
				client.data.user = user;
				this.clients.set(user.id, client);
				client.join(user.id);
				this.userService.updateStatus(user.login, Status.ONLINE);
				this.server.emit("status-changed", {
					login: user.login,
					status: Status.ONLINE,
				});
			} catch (err) {
				client.disconnect();
			}
		}
	}

	async handleDisconnect(client: any) {
		const user: User = client.data.user;
		if (user) {
			if (this.clients?.has(user.id)) {
				this.clients.delete(user.id);
			}
			if (this.selectedChannelClients?.has(user.id)) {
				this.selectedChannelClients.delete(user.id);
			}
			this.userService.updateStatus(user.login, Status.OFFLINE);
			this.server.emit("status-changed", {
				login: user.login,
				status: Status.OFFLINE,
			});
		}
	}

	@SubscribeMessage("join-dm")
	async handleJoinDM(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: { destLogin: string },
	): Promise<SocketResponse> {
		const response: SocketResponse = {};
		const { destLogin } = payload;
		const user = client.data.user;
		try {
			const dest = await this.userService.findOne({ login: destLogin });
			const blockedByDest = await this.userService.isBlockedBy(
				user.login,
				dest.login,
			);
			if (blockedByDest) {
				throw new HttpException("This user blocked you.", 400);
			}
			const dmChannel = await this.channelService.findOrCreateDm(
				user.id,
				dest.id,
			);
			this.channelService.updateNotifNewMessages(
				dmChannel.id,
				user.id,
				false,
			);
			client.join(dmChannel.id);
			client.join(dest.id);
			response.data = dmChannel;
		} catch (err) {
			response.error = err;
		} finally {
			return response;
		}
	}

	@SubscribeMessage("send-dm")
	async handleDm(
		@ConnectedSocket() client: Socket,
		@MessageBody()
		payload: { destId: string; channelId: string; content: string },
	): Promise<SocketResponse> {
		const response: SocketResponse = {};
		const { destId, channelId, content } = payload;
		const author: User = client.data.user;
		try {
			if (content.length === 0 || content.length > 500) {
				throw new BadRequestException(
					"Message must be 1-500 characters.",
				);
			}
			const dest = await this.userService.findOne({ id: destId });
			const dmChannel =
				await this.channelService.findChannelById(channelId);
			const isChannelMember = await this.channelService.isChannelMember(
				author.id,
				dmChannel.id,
			);
			if (!isChannelMember) {
				throw new ForbiddenException(
					"You can't send a message in this room.",
				);
			}
			const blockedByDest = await this.userService.isBlockedBy(
				author.login,
				dest.login,
			);
			if (blockedByDest) {
				throw new ForbiddenException("This user blocked you.");
			}
			const message = await this.chatService.createMessage(
				dmChannel.id,
				author.id,
				content,
			);
			const isOnline = this.clients.has(destId);
			const isInChannel =
				isOnline &&
				this.selectedChannelClients.get(destId) === dmChannel.id;
			if (!isInChannel) {
				await this.channelService.updateNotifNewMessages(
					channelId,
					destId,
					true,
				);
				if (isOnline) {
					client
						.to(destId)
						.emit("notif", { channelId: dmChannel.id });
				}
			}
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
			this.server.to(dmChannel.id).emit("display-message", dmChannel.id);
			response.data = newMessage;
		} catch (err) {
			response.error = err;
		} finally {
			return response;
		}
	}

	@SubscribeMessage("join-chatroom")
	async handleJoinChatroom(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: { channelId: string; password?: string },
	): Promise<SocketResponse> {
		const response: SocketResponse = {};
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
				client.join(channelId);
				response.data = channelId;
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
				client.join(channelId);
				this.server.to(channelId).emit("user-joined", channelId);
				response.data = channelId;
			} else {
				throw new ForbiddenException("Access Denied");
			}
		} catch (err) {
			response.error = err;
		} finally {
			return response;
		}
	}

	@SubscribeMessage("leave-chatroom")
	async handleLeaveChatroom(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: { channelId: string },
	): Promise<SocketResponse> {
		const response: SocketResponse = {};
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
			if (wasAlone) {
				await this.channelService.destroyChannel(channelId);
				this.server.emit("channel-destroyed");
			}
			//leave channel socket room
			client.leave(channelId);
			this.server.to(channelId).emit("user-left", channelId);
			response.data = channelId;
		} catch (err) {
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
		const response: SocketResponse = {};
		const { channelId, content } = payload;
		const author: User = client.data.user;
		try {
			if (content.length === 0 || content.length > 500) {
				throw new BadRequestException(
					"Message must be 1-500 characters.",
				);
			}
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
			response.data = newMessage;
		} catch (err) {
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
		const response: SocketResponse = {};
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
				response.data = {
					action,
					channelName: channel.name,
				};
				this.server.to(kickedId).emit("user-kicked", response.data);
				const kickedClient = this.clients.get(kickedId);
				kickedClient.leave(channelId);
			}
		} catch (err) {
			response.error = err;
		} finally {
			return response;
		}
	}

	@SubscribeMessage("change-status")
	async changeStatus(
		@ConnectedSocket() client: Socket,
		@MessageBody() status: Status,
	): Promise<SocketResponse> {
		const response: SocketResponse = {};
		const user: User = client.data.user;
		try {
			await this.userService.updateStatus(user.login, status);
			response.data = { login: user.login, status };
			this.server.emit("status-changed", response.data);
		} catch (err) {
			response.error = err;
		} finally {
			return response;
		}
	}

	@SubscribeMessage("toggle-chat")
	toggleChat(
		@ConnectedSocket() client: Socket,
		@MessageBody() channelId: string,
	) {
		const user: User = client.data.user;
		if (channelId && channelId.length > 0) {
			this.selectedChannelClients.set(user.id, channelId);
		} else if (user && this.selectedChannelClients.has(user.id)) {
			this.selectedChannelClients.delete(user.id);
		}
	}
}
