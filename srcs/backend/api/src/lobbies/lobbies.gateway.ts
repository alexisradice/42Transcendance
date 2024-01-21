import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
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
import { ChatService } from "src/chat/chat.service";
import { SocketResponse } from "src/types";
import { v4 as uuidv4 } from "uuid";
import { UserService } from "../user/user.service";
import { Player, Settings } from "./game.classes";
import { LobbiesService } from "./lobbies.service";

@WebSocketGateway({
	cors: {
		origin: "http://localhost:5173",
		credentials: true,
	},
	namespace: "lobbies",
})
export class LobbiesGateway
	implements OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer() server: Server;

	constructor(
		private lobbiesService: LobbiesService,
		//private authService: AuthService,
		private userService: UserService,
		private jwtService: JwtService,
		private configService: ConfigService,
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

	async handleConnection(client: Socket) {
		console.log("connected to game");
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
				this.server.emit("connected");
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
				this.server.emit("connected");
			} catch (err) {
				console.error(err);
				client.disconnect();
			}
		}
	}

	async handleDisconnect(client: Socket) {
		console.log("disconnection!");
		client.emit("hello", "disconnection!");
		this.lobbiesService.cleanClient(client);
	}

	@SubscribeMessage("queue")
	async lobbyFunction(client: Socket, settings: Settings) {
		//console.log("settings!", settings);
		//console.log("client.data.login2!", settings[1]);
		//const user = await this.userService.findUserByUsername(settings[1]);
		//console.log("user!", user);

		const player = new Player();
		player.name = client.data.user.login;
		//console.log("client : ", client);
		player.socket = client;
		player.score = 0;
		player.settings = settings;
		player.lobby = null;

		this.lobbiesService.addPlayerToQueue(player);

		//const lobby = this.lobbiesService.lobbyCreateOrFind();
		//this.lobbiesService.lobbyJoin(player, client, lobby);
	}

	@SubscribeMessage("invite-to-game")
	async inviteToGame(
		client: Socket,
		payload: { settings: Settings; opponentLogin: string },
	) {
		const response: SocketResponse = {};
		const { settings, opponentLogin } = payload;
		const inviter: User = client.data.user;
		try {
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

			const lobbyId = uuidv4();
			const lobby = this.lobbiesService.lobbyCreateOrFind(lobbyId);

			const player = new Player();
			player.name = inviter.login;
			player.socket = client;
			player.score = 0;
			player.settings = settings;
			player.lobby = lobby;

			const siteUrl = this.configService.get<string>("REDIRECT_URI");

			const message = await this.chatService.createMessage(
				dmChannel.id,
				inviter.id,
				`Hey, join me on this game: ${siteUrl}game/${lobbyId}`,
			);
			const newMessage = {
				id: message.id,
				createdAt: message.createdAt,
				content: message.content,
				author: {
					login: inviter.login,
					displayName: inviter.displayName,
					image: inviter.image,
				},
			};
			this.server.to(dmChannel.id).emit("display-message", dmChannel.id);
			response.data = newMessage;
		} catch (err) {
			response.error = err.message;
		} finally {
			return response;
		}
	}

	@SubscribeMessage("paddleUp")
	paddleUp(client: Socket): void {
		//console.log("paddleUp");
		this.lobbiesService.updatePaddleUp(client);
	}

	@SubscribeMessage("paddleDown")
	paddleDown(client: Socket): void {
		//console.log("paddleDown");
		this.lobbiesService.updatePaddleDown(client);
	}

	// @SubscribeMessage("launchGame")
	// launchGame(client: Socket, coordinates: any): void {
	// 	console.log("movementBall", coordinates);
	// 	this.lobbiesService.movementsBall(client, coordinates.map, coordinates.ball, coordinates.paddlePlayer1, coordinates.paddlePlayer2);
	// }
}
