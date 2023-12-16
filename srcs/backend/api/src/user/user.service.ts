import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindOneCriteria as FindOneParam, MiniUser } from 'src/types';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async findOne(param: FindOneParam) {
		const user = await this.prisma.user.findFirst({
			where: param
		});
		return user;
	}

	async findOrCreate(user: MiniUser) {
		const foundUser = await this.findOne({email: user.email});
		if (foundUser) {
			return foundUser;
		}
		const createdUser = await this.prisma.user.create({
			data: {
				email: user.email,
				login: user.login,
				displayName: user.login,
				image: user.image,
				// init other things
			}
		});
		return createdUser;
	}
}
