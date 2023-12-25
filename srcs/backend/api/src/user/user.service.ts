import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { UserSettingsDto } from "src/dto";
import { PrismaService } from "src/prisma/prisma.service";
import { FindOneCriteria as FindOneParam, MiniUser } from "src/types";

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
				refreshToken: "null",
				// init other things
			},
		});
		return createdUser;
	}

	async updateUser(login: string, userDto: UserSettingsDto) {
		// if we sent an empty value, then delete the key to not update it in DB
		Object.keys(userDto).forEach((key) => {
			const value = userDto[key];
			if (value == null || value === "") {
				delete userDto[key];
			}
		});
		const user = await this.prisma.user.update({
			where: { login },
			data: userDto,
		});
		return user;
	}
}
