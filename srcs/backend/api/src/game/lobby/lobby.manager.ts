import { Server, Socket } from "socket.io";
import { LobbyMode } from "../types";
import { WsException } from "@nestjs/websockets";
import { Lobby } from "./lobby";
import { InstanceFactory } from "../instance/instance.factory";
import { Cron } from "@nestjs/schedule";

export class LobbyManager {
	public server: Server;
	public instanceFactory: InstanceFactory;

	private readonly lobbies: Map<Lobby["id"], Lobby> = new Map<
		Lobby["id"],
		Lobby
	>();

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

	@Cron("*/5 * * * *")
	private lobbiesCleaner(): void {
		for (const [lobbyId, lobby] of this.lobbies) {
			if (lobby.instance.hasFinished) {
				lobby.clients.forEach((client) => {
					lobby.removeClient(client);
				});
				this.lobbies.delete(lobbyId);
			}
		}
	}
}
