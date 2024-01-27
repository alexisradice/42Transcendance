import { Socket } from "socket.io";
import { GameService } from "../game.service";
import { Lobby } from "../lobby/lobby";
import {
	Ball,
	Board,
	GameResult,
	InstancePlayer,
	Paddle,
	PlayerPaddle,
	ServerPayloads,
} from "../types";

export class Instance {
	public hasStarted: boolean = false;
	public hasFinished: boolean = false;
	public isSuspended: boolean = false;
	public board: Board;
	public ball: Ball;
	public paddleSettings: Paddle;
	public paddleP1: PlayerPaddle;
	public paddleP2: PlayerPaddle;
	public player1: InstancePlayer;
	public player2: InstancePlayer;

	constructor(
		private readonly lobby: Lobby,
		private readonly gameService: GameService,
	) {
		this.player1 = {} as InstancePlayer;
		this.player2 = {} as InstancePlayer;
		this.initializeGame();
	}

	public triggerStart = (): void => {
		if (this.hasStarted) {
			return;
		}
		console.log("READY TO RUUUUUMBLE");
		this.hasStarted = true;
		this.lobby.dispatchToLobby<ServerPayloads["launch"]>("launch", {
			lobbyId: this.lobby.id,
		});
		setTimeout(this.movementsBall, 3000); // 3s starting countdown
	};

	public triggerFinish = async (
		result: GameResult,
	): Promise<Promise<Promise<void>>> => {
		if (this.hasFinished || !this.hasStarted) {
			return;
		}

		console.log("winner:", result.winner.client.id);
		console.log("loser:", result.loser.client.id);
		const { winner, loser } = result;
		const userWinner = winner.client.data.user;
		const userLoser = loser.client.data.user;

		await this.gameService.incrementStats(userWinner, true);
		await this.gameService.incrementStats(userLoser, false);
		await this.gameService.addMatchInHistory(
			userWinner.id,
			userLoser.id,
			winner.score,
			loser.score,
			this.lobby.settings,
		);

		this.lobby.dispatchToLobby<ServerPayloads["gameOver"]>("gameOver", {
			winner: userWinner.displayName,
		});

		this.hasFinished = true;
	};

	private initializeGame = (): void => {
		console.log("this.lobby.settings", this.lobby.settings);
		this.player1.score = 0;
		this.player2.score = 0;
		this.board = { width: 300, height: 100 };
		this.ball = {
			x: this.board.width / 2,
			y: this.board.height / 2,
			directionX: 1,
			directionY: 1,
			speed: this.lobby.settings.ballSpeed,
			radius: 3,
		};
		this.paddleSettings = {
			height: this.lobby.settings.paddleSize,
			width: 6,
		};
		this.paddleP1 = { x: -5, y: 50 };
		this.paddleP2 = { x: 298, y: 50 };
	};

	public setPlayer1(client: Socket): void {
		this.player1.client = client;
	}

	public setPlayer2(client: Socket): void {
		this.player2.client = client;
	}

	public getPlayer1Score(): number {
		return this.player1.score;
	}

	public getPlayer2Score(): number {
		return this.player2.score;
	}

	private movementsBall = (): void => {
		const ballRadius = this.ball.radius;
		const paddleHeight = this.paddleSettings.height;
		const paddleWidth = this.paddleSettings.width;
		const angle = (Math.random() * 90 - 45) * (Math.PI / 180);

		// initialiser la direction de la balle en fonction de l'angle
		this.ball.directionX = Math.cos(angle);
		this.ball.directionY = Math.sin(angle);

		const intervalId = setInterval(() => {
			// déplacement de la balle en fonction de sa direction et de sa vitesse
			this.ball.x += this.ball.directionX * this.ball.speed;
			this.ball.y += this.ball.directionY * this.ball.speed;

			// bloqquer le paddle si trop haut ou trop bas
			const maxPaddleY = this.board.height - paddleHeight;
			if (this.paddleP1.y < 0) {
				this.paddleP1.y = 0;
			} else if (this.paddleP1.y > maxPaddleY) {
				this.paddleP1.y = maxPaddleY;
			}

			if (this.paddleP2.y < 0) {
				this.paddleP2.y = 0;
			} else if (this.paddleP2.y > maxPaddleY) {
				this.paddleP2.y = maxPaddleY;
			}

			// rebond haut et bas de la map
			if (this.ball.y <= 0 || this.ball.y >= this.board.height) {
				this.ball.directionY *= -1; // inverser la direction verticale
			}

			// gestion des collisions avec les raquettes
			if (
				this.ball.y + ballRadius >= this.paddleP1.y &&
				this.ball.y - ballRadius <= this.paddleP1.y + paddleHeight &&
				((this.ball.x - ballRadius <= this.paddleP1.x + paddleWidth &&
					this.ball.x + ballRadius >= this.paddleP1.x) ||
					(this.ball.x + ballRadius >= this.paddleP1.x &&
						this.ball.x - ballRadius <=
							this.paddleP1.x + paddleWidth))
			) {
				// calculer l'angle d'incidence sur la raquette du joueur 1
				const relativeIntersectY =
					this.ball.y - (this.paddleP1.y + paddleHeight / 2);
				const normalizedRelativeIntersectionY =
					relativeIntersectY / (paddleHeight / 2);
				const bounceAngle =
					normalizedRelativeIntersectionY * (Math.PI / 4);

				// modifier la direction de la balle en fonction de l'angle d'incidence
				this.ball.directionX *= -1; // inverser la direction horizontale
				this.ball.directionY = Math.sin(bounceAngle); // mettre à jour la direction verticale
				this.ball.x = this.paddleP1.x + paddleWidth + ballRadius; // Add offset to x position
			}

			if (
				this.ball.y + ballRadius >= this.paddleP2.y &&
				this.ball.y - ballRadius <= this.paddleP2.y + paddleHeight &&
				((this.ball.x - ballRadius <= this.paddleP2.x + paddleWidth &&
					this.ball.x + ballRadius >= this.paddleP2.x) ||
					(this.ball.x + ballRadius >= this.paddleP2.x &&
						this.ball.x - ballRadius <=
							this.paddleP2.x + paddleWidth))
			) {
				// calculer l'angle d'incidence sur la raquette du joueur 2
				const relativeIntersectY =
					this.ball.y - (this.paddleP2.y + paddleHeight / 2);
				const normalizedRelativeIntersectionY =
					relativeIntersectY / (paddleHeight / 2);
				const bounceAngle =
					normalizedRelativeIntersectionY * (Math.PI / 4);
				// modifier la direction de la balle en fonction de l'angle d'incidence
				this.ball.directionX *= -1; // inverser la direction horizontale
				this.ball.directionY = Math.sin(bounceAngle); // mettre à jour la direction verticale
				this.ball.x = this.paddleP2.x - ballRadius; // Add offset to x position
			}

			this.lobby.dispatchToLobby<ServerPayloads["playerNames"]>(
				"playerNames",
				{
					P1Name: this.player1.client.data.user.displayName,
					P2Name: this.player2.client.data.user.displayName,
				},
			);

			this.lobby.dispatchToLobby<ServerPayloads["ballPosition"]>(
				"ballPosition",
				{
					x: this.ball.x,
					y: this.ball.y,
				},
			);

			this.lobby.dispatchToLobby<ServerPayloads["paddlePosition"]>(
				"paddlePosition",
				{
					P1: this.paddleP1.y,
					P2: this.paddleP2.y,
				},
			);

			const winner = this.detectScoredPoint();

			if (winner) {
				clearInterval(intervalId);
				this.triggerFinish(winner);
			}
		}, 16.66666);
	};

	private detectScoredPoint = (): GameResult | null => {
		const player2Scored = this.ball.x <= 0;
		const player1Scored = this.ball.x >= this.board.width;

		if (player1Scored || player2Scored) {
			if (player1Scored) {
				this.player1.score++;
			} else {
				this.player2.score++;
			}
			const newAngle = (Math.random() * 90 - 45) * (Math.PI / 180);
			const randomDirection = Math.random() > 0.5 ? 1 : -1;
			this.ball.directionX = Math.cos(newAngle) * randomDirection;
			this.ball.directionY = Math.sin(newAngle);
			this.ball.x = this.board.width / 2;
			this.ball.y = this.board.height / 2;
			this.lobby.dispatchToLobby<ServerPayloads["pointScored"]>(
				"pointScored",
				{
					scoreP1: this.player1.score,
					scoreP2: this.player2.score,
				},
			);
		}

		const scoreP1 = this.player1.score;
		const scoreP2 = this.player2.score;

		const p1won = scoreP1 >= 11;
		const p2won = scoreP2 >= 11;

		if (p1won || p2won) {
			const results: GameResult = {} as GameResult;
			if (p1won) {
				results.winner = this.player1;
				results.loser = this.player2;
			} else if (p2won) {
				results.winner = this.player2;
				results.loser = this.player1;
			}
			return results;
		}
		return null;
	};

	public movePaddle = (direction: "up" | "down", client: Socket): void => {
		const userId = client.data.user.id;
		const movement = direction === "up" ? -3 : 3;
		if (userId === this.player1.client.data.user.id) {
			this.paddleP1.y += movement;
		} else if (userId === this.player2.client.data.user.id) {
			this.paddleP2.y += movement;
		}
	};
}
