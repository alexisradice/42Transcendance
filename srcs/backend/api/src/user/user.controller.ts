import {
	Body,
	Controller,
	FileTypeValidator,
	Get,
	HttpException,
	MaxFileSizeValidator,
	Param,
	ParseFilePipe,
	Patch,
	Post,
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
import { Status } from "@prisma/client";
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
			twoFA: user.twoFA,
		};
	}

	@Get(":login")
	@UseGuards(JwtGuard)
	async getUser(@Param("login") login: string) {
		const user = await this.userService.findOne({ login });
		return {
			login: user.login,
			displayName: user.displayName,
			image: user.image,
			status: user.status,
		};
	}

	@Get("search/:searchString")
	@UseGuards(JwtGuard)
	async searchUser(@Param("searchString") searchString: string) {
		return await this.userService.searchUser(searchString);
	}

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
		let fileType: string | null;
		let base64Image: string | null;
		if (image) {
			// extra protection against file type renaming
			fileType = this.userService.validateAvatar(image.buffer);
			if (!fileType) {
				throw new HttpException("Invalid file type", 400);
			}
			base64Image = image.buffer.toString("base64");
		}
		const user = await this.userService.updateUser(req.user["login"], {
			displayName: userDto.displayName,
			image: image
				? `data:image/${fileType};base64,${base64Image}`
				: undefined,
		});
		return user;
	}

	@Patch("updateStatus")
	@UseGuards(JwtGuard)
	async updateUserStatus(
		@Body("status") status: Status,
		@Req() req: Request,
	) {
		await this.userService.updateStatus(req.user["login"], status);
		return { success: true };
	}

	@Get("friends/all")
	@UseGuards(JwtGuard)
	async getFriends(@Req() req: Request) {
		const friends = await this.prisma.user.findMany({
			where: { login: req.user["login"] },
			select: {
				friends: {
					select: {
						login: true,
						displayName: true,
						image: true,
						status: true,
					},
				},
			},
		});
		return friends[0].friends;
	}

	@Post("friends/add")
	@UseGuards(JwtGuard)
	async addFriend(
		@Body("friendLogin") friendLogin: string,
		@Req() req: Request,
	) {
		const login = req.user["login"];
		if (login === friendLogin) {
			throw new HttpException("That's you!", 400);
		}
		const isBlocked = await this.userService.isBlocked(login, friendLogin);
		if (isBlocked) {
			throw new HttpException("You blocked this user.", 400);
		}
		const isBlockedBy = await this.userService.isBlockedBy(
			login,
			friendLogin,
		);
		if (isBlockedBy) {
			throw new HttpException("This user blocked you.", 400);
		}
		await this.userService.addFriendship(login, friendLogin);
		return { success: true };
	}

	@Post("friends/remove")
	@UseGuards(JwtGuard)
	async removeFriend(
		@Body("friendLogin") friendLogin: string,
		@Req() req: Request,
	) {
		await this.userService.removeFriendship(req.user["login"], friendLogin);
		return { success: true };
	}

	@Get("blocked/all")
	@UseGuards(JwtGuard)
	async getBlocked(@Req() req: Request) {
		const blocked = await this.prisma.user.findMany({
			where: { login: req.user["login"] },
			select: {
				blocked: {
					select: {
						login: true,
					},
				},
			},
		});
		return blocked[0].blocked;
	}

	@Post("block")
	@UseGuards(JwtGuard)
	async blockUser(@Body("userLogin") userLogin: string, @Req() req: Request) {
		await this.userService.blockUser(req.user["login"], userLogin);
		return { success: true };
	}

	@Post("unblock")
	@UseGuards(JwtGuard)
	async unblockUser(
		@Body("userLogin") userLogin: string,
		@Req() req: Request,
	) {
		await this.userService.unblockUser(req.user["login"], userLogin);
		return { success: true };
	}

	@Post("twofa/generate")
	@UseGuards(JwtGuard)
	async generateTwoFA(@Req() req: Request) {
		const user = await this.userService.findOne({
			login: req.user["login"],
		});
		const { otpAuthUrl } = await this.authService.generateTwoFASecret(user);
		return this.authService.generateQrCodeDataURL(otpAuthUrl);
	}

	@Post("twofa/activate")
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
