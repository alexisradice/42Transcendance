import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	SubscribeMessage,
	WebSocketGateway,
} from "@nestjs/websockets";
import { Channel } from "@prisma/client";
import { Socket } from "socket.io";
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

	async handleConnection(client: Socket) {
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
		@ConnectedSocket() socket: Socket,
		@MessageBody() channel: Channel,
	): string {
		socket.join(channel.id);
		// TODO: verify if user is allowed to join the channel
		return channel.id;
	}

	@SubscribeMessage("message")
	handleMessage(
		@ConnectedSocket() socket: Socket,
		@MessageBody() payload: { message: string; room: string },
	): string {
		socket.to(payload.room).emit("message", payload.message);
		return payload.message;
	}
}
