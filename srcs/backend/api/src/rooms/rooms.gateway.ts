import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { RoomsService } from "./rooms.service";
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';


@WebSocketGateway({ cors: true})
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private roomsService: RoomsService,
		//private authService: AuthService,
		//private userService: UserService,
		) {}
	
	@WebSocketServer() server: Server;

	async handleConnection(client: Socket) {
			console.log("cconnection!");
		  client.emit('hello', "connection!");
	  }
	
	  async handleDisconnect(client: Socket) {
			console.log("discconnection!");
			client.emit('hello', "disconnection!");
	  }
	
	  @SubscribeMessage('hello')
	  testSocketFunction(client: Socket, payload: any): void {
			console.log("testtestt!", payload);

		  this.roomsService.testFunction(client);
	  }
}
