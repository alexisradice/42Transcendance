import { SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { Socket } from "socket.io";

@WebSocketGateway({
	cors: {
		origin: "http://localhost:5173",
		credentials: true,
	},
	namespace: "game",
})
@WebSocketGateway()
export class GameGateway {
	@SubscribeMessage("message")
	handleMessage(client: Socket, payload: any): string {
		return "Hello world!";
	}
}
