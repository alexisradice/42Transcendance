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
import { Player, Lobby, Settings } from './game.classes';


@WebSocketGateway({ cors: true})
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private roomsService: RoomsService,
		//private authService: AuthService,
		private userService: UserService,
	) {}
	
	@WebSocketServer() server: Server;

	async handleConnection(client: Socket) {
		//console.log(client.id); /* the headers of the initial request */
		//console.log("\n");
		//console.log(client.handshake.headers); /* the headers of the initial request */
		//console.log("\n");
		//console.log(client.handshake.query); /* the query params of the initial request */
		//console.log("\n");
		//console.log(client.handshake.auth); /* the authentication payload */
		//console.log("\n");
		//console.log(client.handshake.time); /* the date of creation (as string) */
		//console.log("\n");
		//console.log(client.handshake.issued); /* the date of creation (unix timestamp) */
		//console.log("\n");
		//console.log(client.handshake.url); /* the request URL string */
		//console.log("\n");
		//console.log(client.handshake.address); /* the ip of the client */
		//console.log("\n");
		//console.log(client.handshake.xdomain); /* whether the connection is cross-domain */
		//console.log("\n");
		//console.log(client.handshake.secure); /* whether the connection is secure */

		console.log("connection!");
		client.emit('hello', "connection!");
	}
	
	async handleDisconnect(client: Socket) {
		console.log("disconnection!");
		client.emit('hello', "disconnection!");
		this.roomsService.cleanClient(client);;
	}

	@SubscribeMessage('login')
	async loginFunction(client: Socket, username: string) {
		//console.log("username!", username);
		const user = await this.userService.findUserByUsername(username);
		//console.log("user!", user);
	}

	@SubscribeMessage('queue')
	async lobbyFunction(client: Socket, settings: Settings) {
		//console.log("settings!", settings);
		//console.log("client.data.login2!", settings[1]);
		//const user = await this.userService.findUserByUsername(settings[1]);
		//console.log("user!", user);

		const player = new Player();
		player.name = settings[1];
		player.socket = client;
		player.score = 0;
		player.settings = settings;

		this.roomsService.addPlayerToQueue(player);


		//const lobby = this.roomsService.lobbyCreateOrFind();
		//this.roomsService.lobbyJoin(player, client, lobby);
	}
	
	@SubscribeMessage('hello')
	testSocketFunction(client: Socket, payload: any): void {
		console.log("testtestt!", payload);
		this.roomsService.testFunction(client);
	}
}
