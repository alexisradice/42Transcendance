import { Server, Socket } from "socket.io";
import { LobbyMode, Settings } from "../types";
import { WsException } from "@nestjs/websockets";
import { Lobby } from "./lobby";
import { InstanceFactory } from "../instance/instance.factory";
import { Cron } from "@nestjs/schedule";
import * as _ from "lodash";

export class LobbyManager {
	public server: Server;
	public instanceFactory: InstanceFactory;

	private readonly lobbies: Map<Lobby["id"], Lobby> = new Map<
		Lobby["id"],
		Lobby
	>();

	public findOrCreateLobby(mode: LobbyMode, settings: Settings): Lobby {
		for (let lobby of this.lobbies.values()) {
			if (_.isEqual(lobby.settings, settings)) {
				console.log("found lobby");
				return lobby;
			}
		}
		return this.createLobby(mode, settings);
	}

	public createLobby(mode: LobbyMode, settings: Settings): Lobby {
		// switch (mode) {
		// 	case "solo":
		// 		maxClients = 1;
		// 		break;

		// 	case "duo":
		// 		maxClients = 2;
		// 		break;
		// }
		const lobby = new Lobby(
			this.instanceFactory,
			this.server,
			mode,
			settings,
		);

		this.lobbies.set(lobby.id, lobby);
		console.log("created lobby");
		return lobby;
	}

	public joinLobby(lobbyId: string, client: Socket): void {
		const lobby = this.lobbies.get(lobbyId);

		if (!lobby) {
			throw new WsException("Lobby expired");
		}

		if (lobby.clients.size >= 2) {
			throw new WsException("Lobby already full");
		}

		this.lobbies.forEach((lobby) => {
			if (lobby.clients.has(client.id)) {
				throw new WsException("Already in a lobby");
			}
		});
		console.log("lobby and client are ok, joining lobby");
		lobby.addClient(client);
	}

	@Cron("*/1 * * * *")
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
