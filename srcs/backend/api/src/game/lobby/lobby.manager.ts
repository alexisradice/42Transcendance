import { Server, Socket } from "socket.io";
import { LobbyMode } from "../types";
import { WsException } from "@nestjs/websockets";
import { Lobby } from "./lobby";
import { InstanceFactory } from "../instance/instance.factory";

export class LobbyManager {
	public server: Server;
	public instanceFactory: InstanceFactory;

	private readonly lobbies: Map<Lobby["id"], Lobby> = new Map<
		Lobby["id"],
		Lobby
	>();

	public initializeSocket(client: Socket): void {
		client.data.lobby = null;
	}

	public terminateSocket(client: Socket): void {
		client.data.lobby?.removeClient(client);
	}

	public createLobby(mode: LobbyMode): Lobby {
		// switch (mode) {
		// 	case "solo":
		// 		maxClients = 1;
		// 		break;

		// 	case "duo":
		// 		maxClients = 2;
		// 		break;
		// }

		const lobby = new Lobby(this.server, mode, this.instanceFactory);

		this.lobbies.set(lobby.id, lobby);

		return lobby;
	}

	public joinLobby(lobbyId: string, client: Socket): void {
		const lobby = this.lobbies.get(lobbyId);

		if (!lobby) {
			throw new WsException("Lobby not found");
		}

		if (lobby.clients.size >= 2) {
			throw new WsException("Lobby already full");
		}

		lobby.addClient(client);
	}
}
