import {
	ForbiddenException,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import * as _ from "lodash";
import { Server, Socket } from "socket.io";
import { InstanceFactory } from "../instance/instance.factory";
import { Settings } from "../types";
import { Lobby } from "./lobby";

export class LobbyManager {
	public server: Server;
	public instanceFactory: InstanceFactory;

	private readonly lobbies: Map<Lobby["id"], Lobby> = new Map<
		Lobby["id"],
		Lobby
	>();

	public findOrCreateLobby(settings: Settings, client: Socket): Lobby {
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
		return this.createLobby(settings, client);
	}

	public createLobby(settings: Settings, client: Socket): Lobby {
		this.lobbies.forEach((lobby) => {
			if (lobby.clients.has(client.id)) {
				throw new ForbiddenException("Already in a lobby");
			}
		});
		const lobby = new Lobby(this.instanceFactory, this.server, settings);

		this.lobbies.set(lobby.id, lobby);
		console.log("created lobby");
		return lobby;
	}

	public verifyLobby(lobbyId: string, client: Socket): void {
		const lobby = this.lobbies.get(lobbyId);

		if (!lobby) {
			throw new NotFoundException("Lobby not found");
		}

		const isInLobby = lobby.clients.has(client.id);

		if (!isInLobby) {
			throw new UnauthorizedException("Lobby expired");
		}
	}

	public joinLobby(lobbyId: string, client: Socket): void {
		const lobby = this.lobbies.get(lobbyId);

		if (!lobby || lobby.instance.hasFinished || lobby.clients.size < 1) {
			throw new NotFoundException("Lobby expired");
		}

		if (lobby.clients.size >= 2) {
			throw new ForbiddenException("Lobby already full");
		}

		this.lobbies.forEach((lobby) => {
			if (lobby.clients.has(client.id)) {
				throw new ForbiddenException("Already in a lobby");
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
