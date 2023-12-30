import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "src/auth/auth.service";

@Module({
	providers: [UserService, JwtService, AuthService],
	controllers: [UserController],
})
export class UserModule {}
