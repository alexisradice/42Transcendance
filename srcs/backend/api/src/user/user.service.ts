import { HttpException, Injectable } from "@nestjs/common";
import { User, Status } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import {
	FindOneCriteria as FindOneParam,
	MiniUser,
	UserSettings,
} from "src/types";

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async searchUser(searchString: string) {
		const users = await this.prisma.user.findMany({
			where: {
				login: {
					contains: searchString,
				},
			},
			select: {
				login: true,
				displayName: true,
				image: true,
				status: true,
			},
		});
		return users;
	}

	async findOne(param: FindOneParam) {
		const user = await this.prisma.user.findFirst({
			where: param,
		});
		return user;
	}

	async findOrCreate(
		user: MiniUser,
	): Promise<{ user: User; firstTime: boolean }> {
		const foundUser = await this.findOne({ login: user.login });
		if (foundUser) {
			return { user: foundUser, firstTime: false };
		}
		const createdUser = await this.prisma.user.create({
			data: {
				login: user.login,
				email: user.email,
				displayName: user.login,
				image: user.image,
				refreshToken: null,
				twoFA: false,
			},
		});
		if (createdUser) {
			await this.prisma.stat.create({
				data: {
					user: {
						connect: { id: createdUser.id },
					},
				},
			});
		}
		return { user: createdUser, firstTime: true };
	}

	async findUserByUsername(login: string) {
		const user = await this.prisma.user.findFirst({
			where: {
				login,
			},
		});

		if (user) {
			return user;
		} else {
			return null;
		}
	}

	async updateUser(login: string, userSettings: UserSettings) {
		// if we sent an empty value, then delete the key to not update it in DB
		Object.keys(userSettings).forEach((key) => {
			const value = userSettings[key];
			if (value == null || value === "") {
				delete userSettings[key];
			}
		});
		try {
			const user = await this.prisma.user.update({
				where: { login },
				data: userSettings,
			});
			return user;
		} catch (e) {
			if (e.code === "P2002") {
				throw new HttpException("Display name already taken.", 409);
			}
			throw e;
		}
	}

	validateAvatar(fileBuffer: Buffer) {
		// Read the first few bytes (magic number) from the file
		const magicNumberBuffer = fileBuffer.subarray(0, 4);

		// Define known magic numbers for supported file types
		const jpegMagicNumber = Buffer.from([0xff, 0xd8]);
		const pngMagicNumber = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

		// Compare the read magic number with known magic numbers
		if (magicNumberBuffer.subarray(0, 2).equals(jpegMagicNumber)) {
			return "jpeg";
		} else if (magicNumberBuffer.equals(pngMagicNumber)) {
			return "png";
		} else {
			return null;
		}
	}

	async updateStatus(login: string, status: Status) {
		await this.prisma.user.update({
			where: { login },
			data: {
				status: status,
			},
		});
	}

	async isBlocked(loginA: string, loginB: string) {
		try {
			const user = await this.prisma.user.findFirst({
				where: { login: loginA },
				select: {
					blocked: {
						where: { login: loginB },
					},
				},
			});
			return user.blocked?.length > 0;
		} catch (e) {
			if (e.code === "P2025") {
				return false;
			}
			throw e;
		}
	}

	async isBlockedBy(loginA: string, loginB: string) {
		try {
			const user = await this.prisma.user.findFirst({
				where: { login: loginB },
				select: {
					blocked: {
						where: { login: loginA },
					},
				},
			});
			return user?.blocked?.length > 0;
		} catch (e) {
			if (e.code === "P2025") {
				return false;
			}
			throw e;
		}
	}

	// /!\ For now, adding a friend is NOT bilateral !

	async addFriendship(loginA: string, loginB: string) {
		try {
			await this.prisma.user.update({
				where: { login: loginA },
				data: { friends: { connect: [{ login: loginB }] } },
			});
		} catch (e) {
			if (e.code === "P2025") {
				throw new HttpException("This user does not exist.", 400);
			}
			throw e;
		}
		// await this.prisma.user.update({
		// 	where: { login: loginB },
		// 	data: { friends: { connect: [{ login: loginA }] } },
		// });
	}

	async removeFriendship(loginA: string, loginB: string) {
		try {
			await this.prisma.user.update({
				where: { login: loginA },
				data: { friends: { disconnect: [{ login: loginB }] } },
			});
		} catch (e) {
			if (e.code === "P2025") {
				throw new HttpException("This user does not exist.", 404);
			}
			throw e;
		}
		// await this.prisma.user.update({
		// 	where: { login: loginB },
		// 	data: { friends: { disconnect: [{ login: loginA }] } },
		// });
	}

	async blockUser(loginA: string, loginB: string) {
		try {
			await this.prisma.user.update({
				where: { login: loginA },
				data: {
					blocked: { connect: [{ login: loginB }] },
					friends: { disconnect: [{ login: loginB }] },
				},
			});
			await this.prisma.user.update({
				where: { login: loginB },
				data: { friends: { disconnect: [{ login: loginA }] } },
			});
		} catch (e) {
			if (e.code === "P2025") {
				throw new HttpException("This user does not exist.", 404);
			}
			throw e;
		}
	}

	async unblockUser(loginA: string, loginB: string) {
		try {
			await this.prisma.user.update({
				where: { login: loginA },
				data: { blocked: { disconnect: [{ login: loginB }] } },
			});
		} catch (e) {
			if (e.code === "P2025") {
				throw new HttpException("This user does not exist.", 404);
			}
			throw e;
		}
	}
}
