import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
} from "@nestjs/websockets";
import { Socket } from "socket.io";

@WebSocketGateway({
	cors: {
		origin: "http://localhost:5173",
	},
	namespace: "chat",
})
export class ChatGateway {
	@SubscribeMessage("message")
	handleMessage(
		@ConnectedSocket() socket: Socket,
		@MessageBody() payload: { message: string; room: string },
	): string {
		socket.to(payload.room).emit("message", payload.message);
		return payload.message;
	}
}
