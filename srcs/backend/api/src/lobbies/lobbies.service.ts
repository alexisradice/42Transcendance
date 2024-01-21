import { Injectable } from "@nestjs/common";

import { Socket } from "socket.io";
import { UserService } from "../user/user.service";
import { Player, Lobby, Settings, Game } from "./game.classes";

import { User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import {
	FindOneCriteria as FindOneParam,
	MiniUser,
	UserSettings,
} from "src/types";

@Injectable()
export class LobbiesService {
	constructor(
		//private game: Game,
		private prisma: PrismaService,
		private userService: UserService,
	) {}

	lobbies: Array<Lobby> = [];
	queue: Array<Player> = [];

	areSettingsEqual(
		settingsPlayer1: Settings,
		settingsPlayer2: Settings,
	): boolean {
		return (
			settingsPlayer1.ballSpeed === settingsPlayer2.ballSpeed &&
			settingsPlayer1.paddleSize === settingsPlayer2.paddleSize &&
			settingsPlayer1.visibility === settingsPlayer2.visibility &&
			settingsPlayer1.inviteFriend === settingsPlayer2.inviteFriend &&
			settingsPlayer1.pause === settingsPlayer2.pause
		);
	}

	addPlayerToQueue(player: Player): void {
		const existingLobbyPlayer1 = this.lobbies.find(
			(lobby) => lobby.player1?.name === player.name,
		);
		const existingLobbyPlayer2 = this.lobbies.find(
			(lobby) => lobby.player2?.name === player.name,
		);

		if (existingLobbyPlayer1 || existingLobbyPlayer2) {
			console.log(`Player ${player.name} is already in a lobby.`);
			console.log("launch");

			if (existingLobbyPlayer1) {
				player.lobby = existingLobbyPlayer1;
				//player.socket = player.lobby.player1.socket;
				player = existingLobbyPlayer1.player1;
				console.log("launch1");

				player.socket.emit(
					"launch",
					player.lobby.player1.name,
					player.lobby.id,
					player.lobby.settings,
				);
			}
			if (existingLobbyPlayer2) {
				player.lobby = existingLobbyPlayer2;
				//player.socket = player.lobby.player2.socket;

				player = existingLobbyPlayer2.player2;
				console.log("launch2");

				player.socket.emit(
					"launch",
					player.lobby.player2.name,
					player.lobby.id,
					player.lobby.settings,
				);
			}
		} else {
			// for (const player of this.queue) {
			// 	console.log("Name:", player.name);
			// 	console.log("Score:", player.score);
			// 	console.log("Settings:", player.settings);
			// 	console.log("---------------------");
			// }

			const playerExists = this.queue.some(
				(pplayer) => pplayer.name === player.name,
			);
			//let queue;

			if (playerExists) {
				console.log(`player with name ${player.name} exists`);
				//queue = this.queue.find((queue) => queue.name === player.name);
			} else {
				console.log(`player with name ${player.name} does not exist`);
				this.queue.push(player);
			}

			if (this.queue.length >= 2) {
				let matchingPlayer;

				for (let i = 0; i < this.queue.length; i++) {
					const currentPlayer = this.queue[i];

					if (
						currentPlayer.name !== player.name &&
						this.areSettingsEqual(
							currentPlayer.settings,
							player.settings,
						)
					) {
						matchingPlayer = currentPlayer;
						break;
					}
				}

				if (matchingPlayer && !player.lobby) {
					const code = this.generateUUID();
					const lobby = this.lobbyCreateOrFind(code);

					this.lobbyJoin(player, lobby);
					this.lobbyJoin(matchingPlayer, lobby);

					this.queue = this.queue.filter(
						(pplayer) =>
							pplayer.name !== player.name &&
							pplayer.name !== matchingPlayer!.name,
					);
				}
			}
		}
	}

	cleanClient(client) {
		for (let i = 0; i < this.queue.length; i++) {
			if (this.queue[i].socket === client) this.queue.splice(i, 1);
		}
	}

	generateUUID(): string {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
			const r = (Math.random() * 16) | 0;
			const v = c === "x" ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	}

	lobbyCreateOrFind(code: string) {
		// for (const llobby of this.lobbies) {
		// 	console.log("Lobby ID:", llobby.id);
		// 	console.log("Settings:", llobby.settings);
		// 	console.log("Player 1:", llobby.player1);
		// 	console.log("Player 2:", llobby.player2);
		// 	console.log("Game Started:", llobby.gameStarted);
		// 	console.log("---------------------");
		// }

		const lobbyExists = this.lobbies.some((lobby) => lobby.id === code);
		let lobby;

		if (lobbyExists) {
			console.log(`Lobby with ID ${code} exists`);
			lobby = this.lobbies.find((lobby) => lobby.id === code);
		} else {
			console.log(`Lobby with ID ${code} does not exist`);

			lobby = new Lobby();
			lobby.id = code;
			lobby.settings = null;
			lobby.player1 = null;
			lobby.player2 = null;
			lobby.gameStarted = false;
			lobby.game = null;

			this.lobbies.push(lobby);
		}
		return lobby;
	}

	lobbyJoin(player: Player, lobby: Lobby): void {
		if (lobby.player1 == null) {
			console.log("player1 is null");
			lobby.player1 = player;
			console.log("player1 is now", lobby.player1.name);
			player.lobby = lobby;
		} else if (lobby.player2 == null) {
			console.log("player2 is null");
			lobby.player2 = player;
			console.log("player2 is now", lobby.player2.name);
			player.lobby = lobby;
		}
		if (lobby.player1 != null && lobby.player2 != null) {
			console.log("lobby is full");
			console.log("player1 is ", lobby.player1.name);
			console.log("player2 is ", lobby.player2.name);
			lobby.settings = lobby.player1.settings;
			console.log(
				"Lobby Info: ID",
				lobby.id,
				" Settings: ",
				lobby.settings,
				" Player1: ",
				lobby.player1.name,
				" Player2: ",
				lobby.player2.name,
				" GameStarted: ",
				lobby.gameStarted,
			);

			lobby.player1.socket.emit(
				"launch",
				lobby.player1.name,
				lobby.id,
				lobby.settings,
			);
			lobby.player2.socket.emit(
				"launch",
				lobby.player2.name,
				lobby.id,
				lobby.settings,
			);

			const game = new Game();
			game.map = { width: 300, height: 100 };
			game.ball = {
				x: game.map.width / 2,
				y: game.map.height / 2,
				directionX: 1,
				directionY: 1,
				speed: 2,
			};
			game.paddlePlayer1 = { x: 1, y: 50, height: 20 };
			game.paddlePlayer2 = { x: 299, y: 50, height: 20 };

			lobby.game = game;

			this.movementsBall(
				lobby.player1.socket,
				lobby.player2.socket,
				lobby,
			);
		}
	}

	movementsBall(
		socketPlayer1: Socket,
		socketPlayer2: Socket,
		lobby: Lobby,
	): void {
		const ballRadius = 2;
		const paddleWidth = 5;
		const angle = (Math.random() * 90 - 45) * (Math.PI / 180);

		// initialiser la direction de la balle en fonction de l'angle
		lobby.game.ball.directionX = Math.cos(angle);
		lobby.game.ball.directionY = Math.sin(angle);

		const intervalId = setInterval(() => {
			// déplacement de la balle en fonction de sa direction et de sa vitesse
			lobby.game.ball.x +=
				lobby.game.ball.directionX * lobby.game.ball.speed;
			lobby.game.ball.y +=
				lobby.game.ball.directionY * lobby.game.ball.speed;

			// bloqquer le paddle si trop haut ou trop bas
			const maxPaddleY =
				lobby.game.map.height - lobby.game.paddlePlayer1.height;
			if (lobby.game.paddlePlayer1.y < 0) {
				lobby.game.paddlePlayer1.y = 0;
			} else if (lobby.game.paddlePlayer1.y > maxPaddleY) {
				lobby.game.paddlePlayer1.y = maxPaddleY;
			}

			const maxPaddleY2 =
				lobby.game.map.height - lobby.game.paddlePlayer2.height;
			if (lobby.game.paddlePlayer2.y < 0) {
				lobby.game.paddlePlayer2.y = 0;
			} else if (lobby.game.paddlePlayer2.y > maxPaddleY2) {
				lobby.game.paddlePlayer2.y = maxPaddleY2;
			}

			// rebond haut et bas de la map
			if (
				lobby.game.ball.y <= 0 ||
				lobby.game.ball.y >= lobby.game.map.height
			) {
				lobby.game.ball.directionY *= -1; // inverser la direction verticale
			}

			// gestion des collisions avec les raquettes
			if (
				lobby.game.ball.y + ballRadius >= lobby.game.paddlePlayer1.y &&
				lobby.game.ball.y - ballRadius <=
					lobby.game.paddlePlayer1.y +
						lobby.game.paddlePlayer1.height &&
				((lobby.game.ball.x - ballRadius <=
					lobby.game.paddlePlayer1.x + paddleWidth &&
					lobby.game.ball.x + ballRadius >=
						lobby.game.paddlePlayer1.x) ||
					(lobby.game.ball.x + ballRadius >=
						lobby.game.paddlePlayer1.x &&
						lobby.game.ball.x - ballRadius <=
							lobby.game.paddlePlayer1.x + paddleWidth))
			) {
				// calculer l'angle d'incidence sur la raquette du joueur 1
				const relativeIntersectY =
					lobby.game.ball.y -
					(lobby.game.paddlePlayer1.y +
						lobby.game.paddlePlayer1.height / 2);
				const normalizedRelativeIntersectionY =
					relativeIntersectY / (lobby.game.paddlePlayer1.height / 2);
				const bounceAngle =
					normalizedRelativeIntersectionY * (Math.PI / 4);

				// modifier la direction de la balle en fonction de l'angle d'incidence
				lobby.game.ball.directionX *= -1; // inverser la direction horizontale
				lobby.game.ball.directionY = Math.sin(bounceAngle); // mettre à jour la direction verticale
				lobby.game.ball.x =
					lobby.game.paddlePlayer1.x + paddleWidth + ballRadius; // Add offset to x position
			}

			if (
				lobby.game.ball.y + ballRadius >= lobby.game.paddlePlayer2.y &&
				lobby.game.ball.y - ballRadius <=
					lobby.game.paddlePlayer2.y +
						lobby.game.paddlePlayer2.height &&
				((lobby.game.ball.x - ballRadius <=
					lobby.game.paddlePlayer2.x + paddleWidth &&
					lobby.game.ball.x + ballRadius >=
						lobby.game.paddlePlayer2.x) ||
					(lobby.game.ball.x + ballRadius >=
						lobby.game.paddlePlayer2.x &&
						lobby.game.ball.x - ballRadius <=
							lobby.game.paddlePlayer2.x + paddleWidth))
			) {
				// calculer l'angle d'incidence sur la raquette du joueur 2
				const relativeIntersectY =
					lobby.game.ball.y -
					(lobby.game.paddlePlayer2.y +
						lobby.game.paddlePlayer2.height / 2);
				const normalizedRelativeIntersectionY =
					relativeIntersectY / (lobby.game.paddlePlayer2.height / 2);
				const bounceAngle =
					normalizedRelativeIntersectionY * (Math.PI / 4);
				// modifier la direction de la balle en fonction de l'angle d'incidence
				lobby.game.ball.directionX *= -1; // inverser la direction horizontale
				lobby.game.ball.directionY = Math.sin(bounceAngle); // mettre à jour la direction verticale
				lobby.game.ball.x = lobby.game.paddlePlayer2.x - ballRadius; // Add offset to x position
			}

			//onsole.log("ball position", lobby.game.ball.x, lobby.game.ball.y);
			socketPlayer1.emit("ballPosition", {
				x: lobby.game.ball.x,
				y: lobby.game.ball.y,
			});
			socketPlayer2.emit("ballPosition", {
				x: lobby.game.ball.x,
				y: lobby.game.ball.y,
			});

			socketPlayer1.emit(
				"paddleDownFront",
				lobby.game.paddlePlayer1.y,
				lobby.game.paddlePlayer2.y,
			);
			socketPlayer2.emit(
				"paddleDownFront",
				lobby.game.paddlePlayer1.y,
				lobby.game.paddlePlayer2.y,
			);
			socketPlayer1.emit(
				"paddleUpFront",
				lobby.game.paddlePlayer1.y,
				lobby.game.paddlePlayer2.y,
			);
			socketPlayer2.emit(
				"paddleUpFront",
				lobby.game.paddlePlayer1.y,
				lobby.game.paddlePlayer2.y,
			);

			if (this.detectScoredPoint(socketPlayer1, socketPlayer2, lobby)) {
				console.log("stop interval");
				clearInterval(intervalId);
				this.lobbies = this.lobbies.filter(
					(lobbyy) => lobbyy.id !== lobby.id,
				);
			}
		}, 16.66666);

		// socketPlayer1.on('disconnect', () => {
		// 	clearInterval(intervalId);
		// });
	}

	detectScoredPoint(
		socketPlayer1: Socket,
		socketPlayer2: Socket,
		lobby: Lobby,
	) {
		const player1Scored = lobby.game.ball.x <= 0;
		const player2Scored = lobby.game.ball.x >= lobby.game.map.width;

		if (player1Scored || player2Scored) {
			const newAngle = (Math.random() * 90 - 45) * (Math.PI / 180);

			let randomDirection;
			if (Math.random() > 0.5) randomDirection = 1;
			else randomDirection = -1;

			lobby.game.ball.directionX = Math.cos(newAngle) * randomDirection;
			lobby.game.ball.directionY = Math.sin(newAngle);
		}

		if (player1Scored) {
			lobby.player1.score++;
			lobby.game.ball.x = lobby.game.map.width / 2;
			lobby.game.ball.y = lobby.game.map.height / 2;
			socketPlayer1.emit(
				"pointScored",
				lobby.player1.score,
				lobby.player2.score,
			);
			socketPlayer2.emit(
				"pointScored",
				lobby.player1.score,
				lobby.player2.score,
			);
			console.log(
				"player1Scored",
				lobby.player1.score,
				lobby.player2.score,
			);
		} else if (player2Scored) {
			lobby.player2.score++;
			lobby.game.ball.x = lobby.game.map.width / 2;
			lobby.game.ball.y = lobby.game.map.height / 2;
			socketPlayer1.emit(
				"pointScored",
				lobby.player1.score,
				lobby.player2.score,
			);
			socketPlayer2.emit(
				"pointScored",
				lobby.player1.score,
				lobby.player2.score,
			);
			console.log(
				"player2Scored",
				lobby.player1.score,
				lobby.player2.score,
			);
		}

		if (lobby.player1.score === 11 || lobby.player2.score === 11) {
			const winner: Player =
				lobby.player1.score === 11 ? lobby.player1 : lobby.player2;
			const loser: Player =
				lobby.player1.score === 11 ? lobby.player2 : lobby.player1;
			this.incrementStats(winner.name, true);
			this.incrementStats(loser.name, false);
			this.addMatchInHistory(
				winner.name,
				loser.name,
				winner.score,
				loser.score,
				lobby,
			);
			socketPlayer1.emit("gameOver", winner.name);
			socketPlayer2.emit("gameOver", winner.name);
			console.log("winner" + winner.name);

			return true;
		}
		return false;
	}

	updatePaddleDown(socket: Socket) {
		for (const lobby of this.lobbies) {
			if (lobby.player1.socket === socket) {
				lobby.game.paddlePlayer1.y += 3;
				socket.emit(
					"paddleDownFront",
					lobby.game.paddlePlayer1.y,
					lobby.game.paddlePlayer2.y,
				);
				//socket.emit('paddleDownFront', lobby.game.paddlePlayer2.y, "player2");
			} else if (lobby.player2.socket === socket) {
				lobby.game.paddlePlayer2.y += 3;
				socket.emit(
					"paddleDownFront",
					lobby.game.paddlePlayer1.y,
					lobby.game.paddlePlayer2.y,
				);
				//socket.emit('paddleDownFront', lobby.game.paddlePlayer2.y, "player2");
			}
		}
	}

	updatePaddleUp(socket: Socket) {
		for (const lobby of this.lobbies) {
			if (lobby.player1.socket === socket) {
				lobby.game.paddlePlayer1.y -= 3;
				socket.emit(
					"paddleUpFront",
					lobby.game.paddlePlayer1.y,
					lobby.game.paddlePlayer2.y,
				);
				//socket.emit('paddleUpFront', lobby.game.paddlePlayer1.y, "player1");
			} else if (lobby.player2.socket === socket) {
				lobby.game.paddlePlayer2.y -= 3;
				socket.emit(
					"paddleUpFront",
					lobby.game.paddlePlayer1.y,
					lobby.game.paddlePlayer2.y,
				);
				//socket.emit('paddleUpFront', lobby.game.paddlePlayer2.y, "player2");
			}
		}
	}

	async incrementStats(userName: string, winner: boolean): Promise<any> {
		try {
			const dbUser = await this.userService.findOne({
				login: userName,
			});
			let existingStat = await this.prisma.stat.findUnique({
				where: {
					userId: dbUser.id,
				},
			});
			let streak: number;
			if (winner) {
				if (existingStat.winStreak >= 0) {
					streak = existingStat.winStreak + 1;
				} else {
					streak = 1;
				}
			} else {
				if (existingStat.winStreak < 0) {
					streak = existingStat.winStreak - 1;
				} else {
					streak = -1;
				}
			}
			await this.prisma.stat.update({
				where: {
					userId: dbUser.id,
				},
				data: {
					gamesPlayed: { increment: 1 },
					wins: { increment: winner ? 1 : 0 },
					losses: { increment: winner ? 0 : 1 },
					winStreak: streak,
				},
			});
		} catch (error) {
			throw new Error(`Error incrementing stats: ${error.message}`);
		}
	}

	async addMatchInHistory(
		winnerName: string,
		loserName: string,
		winnerScore: number,
		loserScore: number,
		lobby: Lobby,
	): Promise<any> {
		try {
			await this.prisma.game.create({
				data: {
					players: {
						connect: [{ login: winnerName }, { login: loserName }],
					},
					winnerScore: winnerScore,
					loserScore: loserScore,
					ballSpeed: lobby.settings.ballSpeed,
					paddleSize: lobby.settings.paddleSize,
					winnerLogin: winnerName,
				},
			});
		} catch (error) {
			throw new Error(`Error adding match in history: ${error.message}`);
		}
	}
}
