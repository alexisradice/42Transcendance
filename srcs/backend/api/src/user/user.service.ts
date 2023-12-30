import { HttpException, Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import {
	FindOneCriteria as FindOneParam,
	MiniUser,
	UserSettings,
} from "src/types";

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async findOne(param: FindOneParam) {
		const user = await this.prisma.user.findFirst({
			where: param,
		});
		return user;
	}

	async findOrCreate(user: MiniUser): Promise<User> {
		const foundUser = await this.findOne({ login: user.login });
		if (foundUser) {
			return foundUser;
		}
		const createdUser = await this.prisma.user.create({
			data: {
				login: user.login,
				email: user.email,
				displayName: user.login,
				image: user.image,
				refreshToken: null,
				twoFA: false,
				// init other things
			},
		});
		return createdUser;
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
		if (
			magicNumberBuffer.subarray(0, 2).equals(jpegMagicNumber) ||
			magicNumberBuffer.equals(pngMagicNumber)
		) {
			return true;
		} else {
			return false;
		}
	}
}
