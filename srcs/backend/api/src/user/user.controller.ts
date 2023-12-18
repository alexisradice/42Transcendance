import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Put,
	UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { UserSettingsDto } from "src/dto";
// import { AuthGuard } from "src/auth/auth.guard";

@Controller("user")
export class UserController {
	constructor(private userService: UserService) {}

	@Get(":login")
	// @UseGuards(AuthGuard)
	async getUser(@Param("login") login) {
		return await this.userService.findOne({ login });
	}

	@Patch("update")
	// @UseGuards(AuthGuard)
	async updateUser(@Body() userDto: UserSettingsDto) {
		await this.userService.updateDisplayName(userDto);
		// await this.userService.updateAvatar(userDto.image);
		// await this.userService.switchTfa(userDto.tfa);
	}
}
