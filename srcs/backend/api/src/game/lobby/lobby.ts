import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { Instance } from "../instance/instance";
import { GameResult, LobbyMode, ServerPayloads, Settings } from "../types";
import { InstanceFactory } from "../instance/instance.factory";

export class Lobby {
	public readonly id: string = uuidv4();

	public readonly createdAt: Date = new Date();

	public readonly clients: Map<Socket["id"], Socket> = new Map<
		Socket["id"],
		Socket
	>();

	public readonly instance: Instance =
		this.instanceFactory.createInstance(this);

	constructor(
		private readonly instanceFactory: InstanceFactory,
		private readonly server: Server,
		public readonly mode: LobbyMode,
		public readonly settings: Settings,
	) {}

	public addClient(client: Socket): void {
		this.clients.set(client.id, client);
		client.join(this.id);
		client.data.lobby = this;
		console.log("client joined lobby", this.id, client.id);

		if (this.clients.size === 1) {
			this.instance.setPlayer1(client);
		}

		if (this.clients.size >= 2) {
			this.instance.setPlayer2(client);
			this.instance.triggerStart();
		}

		this.dispatchLobbyState();
	}

	public async removeClient(client: Socket): Promise<void> {
		this.clients.delete(client.id);
		client.leave(this.id);
		client.data.lobby = null;

		if (this.instance.hasStarted && !this.instance.hasFinished) {
			// If player leave then the game isn't worth to play anymore
			const result: GameResult = {} as GameResult;
			this.clients.forEach((lobbyClient) => {
				if (lobbyClient.id === client.id) {
					result.loser = lobbyClient.data.user;
				} else {
					result.winner = lobbyClient.data.user;
				}
			});
			await this.instance.triggerFinish(result);
			// Alert the remaining player that client left lobby
			this.dispatchToLobby<ServerPayloads["gameNotif"]>("gameNotif", {
				color: "blue",
				message: "Opponent left lobby",
			});
		}

		this.dispatchLobbyState();
	}

	public dispatchLobbyState(): void {
		const payload: ServerPayloads["lobbyState"] = {
			lobbyId: this.id,
			mode: this.mode,
			hasStarted: this.instance.hasStarted,
			hasFinished: this.instance.hasFinished,
			isSuspended: this.instance.isSuspended,
			scores: {
				scoreP1: this.instance.getPlayer1Score(),
				scoreP2: this.instance.getPlayer2Score(),
			},
		};

		this.dispatchToLobby("lobbyState", payload);
	}

	public dispatchToLobby<T>(event: string, payload: T): void {
		this.server.to(this.id).emit(event, payload);
	}
}
