import { Server, Socket } from "socket.io";
import { LobbyMode, Settings } from "../types";
import { WsException } from "@nestjs/websockets";
import { Lobby } from "./lobby";
import { InstanceFactory } from "../instance/instance.factory";
import * as _ from "lodash";

export class LobbyManager {
	public server: Server;
	public instanceFactory: InstanceFactory;

	private readonly lobbies: Map<Lobby["id"], Lobby> = new Map<
		Lobby["id"],
		Lobby
	>();

	public findOrCreateLobby(mode: LobbyMode, settings: Settings): Lobby {
		this.lobbiesCleaner();
		for (let lobby of this.lobbies.values()) {
			if (
				!lobby.instance.hasFinished &&
				_.isEqual(lobby.settings, settings)
			) {
				console.log("found lobby");
				return lobby;
			}
		}
		return this.createLobby(mode, settings);
	}

	public createLobby(mode: LobbyMode, settings: Settings): Lobby {
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

	public verifyLobby(lobbyId: string, client: Socket): void {
		const lobby = this.lobbies.get(lobbyId);

		if (!lobby) {
			throw new WsException("Lobby not found");
		}

		const isInLobby = lobby.clients.has(client.id);

		if (!isInLobby) {
			throw new WsException("Unauthorized access to lobby");
		}
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

	private lobbiesCleaner(): void {
		for (const [lobbyId, lobby] of this.lobbies) {
			if (lobby.instance.hasFinished) {
				lobby.clients.forEach((client) => {
					console.log("Removing client", client.id);
					lobby.removeClient(client);
				});
				console.log("Destroying", lobbyId);
				this.lobbies.delete(lobbyId);
			}
		}
	}
}
