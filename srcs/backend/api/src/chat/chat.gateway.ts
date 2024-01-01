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
import { Channel } from "@prisma/client";
import { Server, Socket } from "socket.io";
import { UserService } from "src/user/user.service";

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
	handleJoinChatroom(
		@ConnectedSocket() client: Socket,
		@MessageBody() channel: Channel,
	): string {
		console.log("joined room " + channel.id);
		// client.data.user ==> infos user
		// TODO: find channel in db with channel id
		client.join(channel.id);
		// TODO: verify if user is allowed to join the channel
		return channel.id;
	}

	@SubscribeMessage("send-message")
	handleMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: { message: string; channel: string },
	): string {
		const { message, channel } = payload;
		console.log('received message "' + message + '"');
		console.log('sending to room "' + channel + '"');
		// TODO: Ajouter le message en DB
		// TODO: renvoyer l'objet Message de la DB au lieu de la string
		this.server.to(channel).emit("display-message", message);
		return message;
	}
}
