import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WsException,
	WsResponse,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import * as argon2 from "argon2";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UserService } from "src/user/user.service";
import { LobbyManager } from "./lobby/lobby.manager";
import { GameService } from "./game.service";
import { InstanceFactory } from "./instance/instance.factory";
import { LobbyMode, ServerPayloads } from "./types";

@WebSocketGateway({
	cors: {
		origin: "http://localhost:5173",
		credentials: true,
	},
	namespace: "game",
})
@WebSocketGateway()
export class GameGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	constructor(
		private jwtService: JwtService,
		private configService: ConfigService,
		private userService: UserService,
		private lobbyManager: LobbyManager,
		private instanceFactory: InstanceFactory,
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
		client.data.lobby?.removeClient(client);
	}

	@SubscribeMessage("create-lobby")
	onLobbyCreate(
		client: Socket,
		data: { mode: LobbyMode },
	): WsResponse<ServerPayloads["gameNotif"]> {
		const lobby = this.lobbyManager.createLobby(data.mode);
		lobby.addClient(client);

		return {
			event: "gameNotif",
			data: {
				color: "green",
				message: "Lobby created",
			},
		};
	}

	@SubscribeMessage("join-lobby")
	onLobbyJoin(client: Socket, data: { lobbyId: string }): void {
		this.lobbyManager.joinLobby(data.lobbyId, client);
	}

	@SubscribeMessage("leave-lobby")
	onLobbyLeave(client: Socket): void {
		client.data.lobby?.removeClient(client);
	}

	@SubscribeMessage("move-paddle")
	onMovePaddle(client: Socket, data: { direction: "up" | "down" }): void {
		if (!client.data.lobby) {
			throw new WsException("You are not in a lobby");
		}
		client.data.lobby.instance.movePaddle(data.direction, client);
	}
}
