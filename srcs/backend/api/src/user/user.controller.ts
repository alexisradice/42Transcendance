import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
	constructor(private userService: UserService) {}

	@Get('/:login')
	// @UseGuards(jwtGuard)
	async getUser(@Param('login') login) {
		return await this.userService.findOne({login})
	}
}
