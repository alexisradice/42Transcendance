import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { Lobby } from "./lobby/lobby";

@Injectable()
export class GameService {
	constructor(private prisma: PrismaService) {}

	async incrementStats(user: User, isWinner: boolean): Promise<any> {
		try {
			let existingStat = await this.prisma.stat.findUnique({
				where: {
					userId: user.id,
				},
			});
			let streak: number;
			if (isWinner) {
				if (existingStat.winStreak >= 0) {
					streak = existingStat.winStreak + 1;
				} else {
					streak = 1;
				}
			} else {
				if (existingStat.winStreak < 0) {
					streak = existingStat.winStreak - 1;
				} else {
					streak = 0;
				}
			}
			await this.prisma.stat.update({
				where: {
					userId: user.id,
				},
				data: {
					gamesPlayed: { increment: 1 },
					wins: { increment: isWinner ? 1 : 0 },
					losses: { increment: isWinner ? 0 : 1 },
					winStreak: streak,
				},
			});
		} catch (error) {
			throw new Error(`Error incrementing stats: ${error.message}`);
		}
	}

	async addMatchInHistory(
		winnerId: string,
		loserId: string,
		winnerScore: number,
		loserScore: number,
	): Promise<any> {
		try {
			await this.prisma.game.create({
				data: {
					players: {
						connect: [{ id: winnerId }, { id: loserId }],
					},
					winnerScore,
					loserScore,
					ballSpeed: 5, // TODO: change this
					paddleSize: "small", // TODO: change this
					winnerId,
				},
			});
		} catch (error) {
			throw new Error(`Error adding match in history: ${error.message}`);
		}
	}
}
