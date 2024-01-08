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
		) 
	{}

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
		// for (const player of this.queue) {
		// 	console.log("Name:", player.name);
		// 	console.log("Score:", player.score);
		// 	console.log("Settings:", player.settings);
		// 	console.log("---------------------");
		// }

		const playerExists = this.queue.some(
			(pplayer) => pplayer.name === player.name,
		);
		let queue;

		if (playerExists) {
			console.log(`player with name ${player.name} exists`);
			queue = this.queue.find((queue) => queue.name === player.name);
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

			if (matchingPlayer) {
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
			game.ball = { x: game.map.width / 2, y: game.map.height / 2, directionX: 3, directionY: 7, speed: 1};
			game.paddlePlayer1 = { y: 10, height: 100 };
			game.paddlePlayer2 = { y: 50, height: 100 };

			lobby.game = game;

			this.movementsBall(lobby.player1.socket, lobby);

		}
	}

	movementsBall(socket: Socket, lobby: Lobby): void {

		const intervalId = setInterval(() => {
			// déplacement de la balle en fonction de sa direction et de sa vitesse
			lobby.game.ball.x += lobby.game.ball.directionX * lobby.game.ball.speed;
			lobby.game.ball.y += lobby.game.ball.directionY * lobby.game.ball.speed;



			// rebond haut et bas de la map
			if (lobby.game.ball.y <= 0 || lobby.game.ball.y >= lobby.game.map.height) {
				lobby.game.ball.directionY *= -1; // inverser la direction verticale
			}



			// gestion des collisions avec les raquettes
			if (
			(lobby.game.ball.y <= lobby.game.paddlePlayer1.y + lobby.game.paddlePlayer1.height && lobby.game.ball.y >= lobby.game.paddlePlayer1.y) ||
			(lobby.game.ball.y <= lobby.game.paddlePlayer2.y + lobby.game.paddlePlayer2.height && lobby.game.ball.y >= lobby.game.paddlePlayer2.y)
			) {
			if (
				(lobby.game.ball.x <= 0 && lobby.game.ball.directionX === -1) ||
				(lobby.game.ball.x >= lobby.game.map.width && lobby.game.ball.directionX === 1)
			) {
				// calculer l'angle d'incidence en fonction de la position de la balle sur la raquette
				const angle = (lobby.game.ball.y - (lobby.game.ball.directionY === -1 ? lobby.game.paddlePlayer1.y : lobby.game.paddlePlayer2.y)) / lobby.game.paddlePlayer1.height * Math.PI / 4;
			
				// calculer la nouvelle direction de la balle en fonction de l'angle d'incidence
				lobby.game.ball.directionX *= -1; // inverser la direction horizontale
				lobby.game.ball.directionY = Math.sin(angle); // mettre à jour la direction verticale avec le sinus de l'angle
			}
			}
		

			console.log("ball position", lobby.game.ball.x, lobby.game.ball.y);
			socket.emit('ballPosition', { x: lobby.game.ball.x, y: lobby.game.ball.y });
			if (this.detectScoredPoint(socket, lobby)) {
				console.log("stop interval");
				clearInterval(intervalId);
			}
		}, 16.66666);


		socket.on('disconnect', () => {
			clearInterval(intervalId);
		});
	}


	detectScoredPoint(socket: Socket, lobby: Lobby) {
		//console.log("detectScoredPoint" + lobby.player1.score, lobby.player2.score);
		const player1Scored = lobby.game.ball.x <= 0;
		const player2Scored = lobby.game.ball.x >= lobby.game.map.width;
	
		if (player1Scored) {
			lobby.player1.score++;
			lobby.game.ball.x = lobby.game.map.width / 2;
			socket.emit('pointScored', { player1Score: lobby.player1.score, player2Score: lobby.player2.score });
			console.log("player1Scored", lobby.player1.score, lobby.player2.score);

		} else if (player2Scored) {
			lobby.player2.score++;
			lobby.game.ball.x = lobby.game.map.width / 2;
			socket.emit('pointScored', { player1Score: lobby.player1.score, player2Score: lobby.player2.score });
			console.log("player2Scored", lobby.player1.score, lobby.player2.score);
		}
		
	
		if (lobby.player1.score === 11 || lobby.player2.score === 11) {
			let winner;
			if (lobby.player1.score === 11) {
			winner = lobby.player1;
			this.incrementStats(lobby.player1.name, true, true, false);
			this.incrementStats(lobby.player2.name, true, false, true);
			}
			else if (lobby.player2.score === 11) {
				winner = lobby.player2;
				this.incrementStats(lobby.player1.name, true, false, true);
				this.incrementStats(lobby.player2.name, true, true, false);
			}
			socket.emit('gameOver', winner.name);
			console.log("winner" + winner.name);

			return true;
		}
		return false;
	}

	updatePaddleDown(socket: Socket, coordinates: any) {
		coordinates.y = coordinates.y - 10;
		for (const lobby of this.lobbies) {
			if (lobby.player1.socket === socket) {
				lobby.game.updatePaddlePlayer1(coordinates.y);
			} else if (lobby.player2.socket === socket) {
				lobby.game.updatePaddlePlayer2(coordinates.y);
			}
		}
	}

	updatePaddleUp(socket: Socket, coordinates: any) {
		coordinates.y = coordinates.y + 10;
		for (const lobby of this.lobbies) {
			if (lobby.player1.socket === socket) {
				lobby.game.updatePaddlePlayer1(coordinates.y);
			} else if (lobby.player2.socket === socket) {
				lobby.game.updatePaddlePlayer2(coordinates.y);
			}
		}
	}

	async incrementStats(userName: string, incrementGames: boolean, incrementWins: boolean, incrementLosses: boolean): Promise<any> {
		try {

		const dbUser = await this.userService.findOne({
			login: userName,
		});

		let existingStat = await this.prisma.stat.findUnique({
			where: {
				userId: dbUser.id,
			},
		});
	
		if (!existingStat) {
			existingStat = await this.prisma.stat.create({
				data: {
					gamesPlayed: 0,
					wins: 0,
					losses: 0,
					user: {
						connect : { id : dbUser.id },
					}
				},
				});
		}
	
		let updatedData: any = {};
		if (incrementGames) {
			updatedData.gamesPlayed = existingStat.gamesPlayed + 1;
		}
		if (incrementWins) {
			updatedData.wins = existingStat.wins + 1;
		}
		if (incrementLosses) {
			updatedData.losses = existingStat.losses + 1;
		}
	

		await this.prisma.stat.update({
			where: {
				userId: dbUser.id,
			},
			data: updatedData,
		});
		} catch (error) {
		throw new Error(`Error incrementing stats: ${error.message}`);
		}
	}
}
