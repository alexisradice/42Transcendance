import {
	BadRequestException,
	ForbiddenException,
	UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsException,
} from "@nestjs/websockets";
import { Status, User } from "@prisma/client";
import * as argon2 from "argon2";
import { Server, Socket } from "socket.io";
import { ChannelService } from "src/channel/channel.service";
import { ChatService } from "src/chat/chat.service";
import {
	BALL_SPEEDS,
	PADDLE_SIZE as PADDLE_SIZES,
	SocketResponse,
} from "src/types";
import { UserService } from "src/user/user.service";
import { InstanceFactory } from "./instance/instance.factory";
import { LobbyManager } from "./lobby/lobby.manager";
import { Settings } from "./types";

@WebSocketGateway({
	namespace: "game",
})
export class GameGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer()
	server: Server;

	constructor(
		private jwtService: JwtService,
		private configService: ConfigService,
		private userService: UserService,
		private lobbyManager: LobbyManager,
		private instanceFactory: InstanceFactory,
		private channelService: ChannelService,
		private chatService: ChatService,
	) {}

	afterInit(server: Server): any {
		this.lobbyManager.server = server;
		this.lobbyManager.instanceFactory = this.instanceFactory;
	}

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

	async handleConnection(client: Socket) {
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
				client.data.lobby = null;
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
				client.data.lobby = null;
			} catch (err) {
				console.error(err);
				client.disconnect();
			}
		}
	}

	async handleDisconnect(client: Socket) {
		await client.data.lobby?.removeClient(client);
	}

	@SubscribeMessage("queue")
	launchQueue(client: Socket, data: { settings: Settings }) {
		const { settings } = data;
		if (
			settings.ballSpeed < 1 ||
			settings.ballSpeed > 5 ||
			settings.paddleSize < 10 ||
			settings.paddleSize > 30
		) {
			throw new BadRequestException("Invalid settings");
		}
		const lobby = this.lobbyManager.findOrCreateLobby(settings, client);
		lobby.addClient(client);

		const login = client.data.user.login;
		this.userService.updateStatus(login, Status.IN_QUEUE);
		this.server.emit("status-changed", {
			login,
			status: Status.IN_QUEUE,
		});
	}

	@SubscribeMessage("create-invite")
	async onLobbyCreate(
		client: Socket,
		data: { settings: Settings; opponentLogin: string },
	) {
		const response = {} as SocketResponse;
		try {
			const lobby = this.lobbyManager.createLobby(data.settings, client);
			lobby.addClient(client);

			const inviter: User = client.data.user;
			const opponentLogin = data.opponentLogin;
			const opponent = await this.userService.findOne({
				login: opponentLogin,
			});
			const dmChannel = await this.channelService.findOrCreateDm(
				inviter.id,
				opponent.id,
			);
			const blockedByOpponent = await this.userService.isBlockedBy(
				inviter.login,
				opponent.login,
			);
			if (blockedByOpponent) {
				throw new ForbiddenException("This user blocked you.");
			}

			client.join(dmChannel.id);
			client.join(opponent.id);

			const siteUrl = this.configService.get<string>("REDIRECT_URI");

			await this.chatService.createMessage(
				dmChannel.id,
				inviter.id,
				`Hey, join me on this game (${
					BALL_SPEEDS[lobby.settings.ballSpeed]
				} ball, ${
					PADDLE_SIZES[lobby.settings.paddleSize]
				} paddle) ${siteUrl}/game/${lobby.id}`,
			);
			this.server.to(dmChannel.id).emit("display-message", dmChannel.id);
		} catch (err) {
			response.error = err;
		} finally {
			return response;
		}
	}

	@SubscribeMessage("verify-lobby")
	onVerifyLobby(client: Socket, data: { lobbyId: string }): SocketResponse {
		const response = {} as SocketResponse;
		try {
			this.lobbyManager.verifyLobby(data.lobbyId, client);
		} catch (err) {
			response.error = err;
		} finally {
			return response;
		}
	}

	@SubscribeMessage("join-lobby")
	onLobbyJoin(client: Socket, data: { lobbyId: string }): SocketResponse {
		const response = {} as SocketResponse;
		try {
			this.lobbyManager.joinLobby(data.lobbyId, client);
		} catch (err) {
			response.error = err;
		} finally {
			return response;
		}
	}

	@SubscribeMessage("leave-lobby")
	onLobbyLeave(client: Socket): void {
		client.data.lobby?.removeClient(client);
	}

	@SubscribeMessage("move-paddle")
	onMovePaddle(client: Socket, data: { direction: "up" | "down" }): void {
		if (!client.data.lobby) {
			throw new ForbiddenException("You are not in a lobby");
		}
		client.data.lobby.instance.movePaddle(data.direction, client);
	}
}
