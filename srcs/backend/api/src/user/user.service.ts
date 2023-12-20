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
			console.log("FOUND USER IN DB", foundUser.login);
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
		console.log("CREATED USER IN DB", user.login);
		return createdUser;
	}

	async updateDisplayName(userDto: UserSettingsDto) {
		const user = await this.prisma.user.update({
			where: { login: userDto.login },
			data: { displayName: userDto.displayName },
		});
		return user;
	}
}
