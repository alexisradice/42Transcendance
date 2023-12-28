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
	UnauthorizedException,
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
import { AuthService } from "src/auth/auth.service";
import { PrismaService } from "src/prisma/prisma.service";
// import { AuthGuard } from "src/auth/auth.guard";

@Controller("user")
export class UserController {
	constructor(
		private userService: UserService,
		private jwtService: JwtService,
		private authService: AuthService,
		private prisma: PrismaService,
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
			const valid = this.userService.validateAvatar(image.buffer);
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

	@Patch("twofa/generate")
	@UseGuards(JwtGuard)
	async generateTwoFA(@Req() req: Request) {
		const user = await this.userService.findOne({
			login: req.user["login"],
		});
		const { otpAuthUrl } = await this.authService.generateTwoFASecret(user);
		return this.authService.generateQrCodeDataURL(otpAuthUrl);
	}

	@Patch("twofa/activate")
	@UseGuards(JwtGuard)
	async setTwoFAOnOff(
		@Body("pinCode") pinCode: string,
		@Body("enable") enable: boolean,
		@Req() req: Request,
	) {
		const login = req.user["login"];
		const user = await this.userService.findOne({
			login,
		});
		const isCodeValid = await this.authService.verifyTwoFACode(
			pinCode,
			user,
		);
		if (!isCodeValid) {
			throw new UnauthorizedException("Wrong authentification code");
		}
		await this.prisma.user.update({
			where: { login },
			data: { twoFA: enable },
		});
		return { success: true };
	}
}
