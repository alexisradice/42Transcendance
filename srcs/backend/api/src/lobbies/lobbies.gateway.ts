import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
} from "@nestjs/websockets";
import * as argon2 from "argon2";
import { Server, Socket } from "socket.io";
import { LobbiesService } from "./lobbies.service";
import { AuthService } from "../auth/auth.service";
import { UserService } from "../user/user.service";
import { Player, Lobby, Settings, Game } from "./game.classes";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@WebSocketGateway({
	cors: {
		origin: "http://localhost:5173",
		credentials: true,
	},
	namespace: "game",
})
export class LobbiesGateway
	implements OnGatewayConnection, OnGatewayDisconnect
{
	constructor(
		private lobbiesService: LobbiesService,
		//private authService: AuthService,
		private userService: UserService,
		private jwtService: JwtService,
		private configService: ConfigService,
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

	@WebSocketServer() server: Server;

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
		player.name = client.data.user.displayName;
		//console.log("client : ", client);
		player.socket = client;
		player.score = 0;
		player.settings = settings;
		player.lobby = null;

		this.lobbiesService.addPlayerToQueue(player);

		//const lobby = this.lobbiesService.lobbyCreateOrFind();
		//this.lobbiesService.lobbyJoin(player, client, lobby);
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
