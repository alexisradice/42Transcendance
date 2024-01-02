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
import { ChannelService } from "src/channel/channel.service";
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
		private channelService: ChannelService,
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
		@MessageBody() channel: Channel, //ou juste channel id ?
	) {
		console.log("joined room " + channel.id);
		const user = client.data.user;
		const chan = await this.channelService.findById(channel.id);
		// TODO: verify if user is allowed to join the channel
		if (this.channelService.isUserInChannel(user, chan)) {
			client.join(channel.id);
		}
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
