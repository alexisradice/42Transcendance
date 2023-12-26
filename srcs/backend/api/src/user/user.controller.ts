import {
	Body,
	Controller,
	FileTypeValidator,
	Get,
	HttpException,
	MaxFileSizeValidator,
	ParseFilePipe,
	Patch,
	Req,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request } from "express";
import { JwtGuard } from "src/auth/jwtToken.guard";
import { UserSettingsDto } from "src/dto";
import { UserService } from "./user.service";
// import { AuthGuard } from "src/auth/auth.guard";

@Controller("user")
export class UserController {
	constructor(
		private userService: UserService,
		private jwtService: JwtService,
	) {}

	@Get("me")
	@UseGuards(JwtGuard)
	async getMe(@Req() req: Request) {
		const user = await this.userService.findOne({
			login: req.user["login"],
		});
		return {
			login: user.login,
			displayName: user.displayName,
			image: user.image,
		};
	}

	// @Get(":login")
	// @UseGuards(JwtGuard)
	// async getUser(@Param("login") login: string) {
	// 	return await this.userService.findOne({ login });
	// }

	@Patch("update")
	@UseGuards(JwtGuard)
	@UseInterceptors(FileInterceptor("image"))
	async updateUser(
		@Req() req: Request,
		@Body() userDto: UserSettingsDto,
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 5_000_000 }),
					new FileTypeValidator({ fileType: /image\/(jpeg|png)/ }),
				],
				fileIsRequired: false,
			}),
		)
		image?: Express.Multer.File,
	) {
		if (image) {
			// extra protection against file type renaming
			const valid = this.userService.validateFile(image.buffer);
			if (!valid) {
				throw new HttpException("Invalid file type", 400);
			}
		}
		const user = await this.userService.updateUser(req.user["login"], {
			displayName: userDto.displayName,
			image: image?.buffer.toString("base64"),
		});
		return user;
	}
}
