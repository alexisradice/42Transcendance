import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthStrategy } from "./auth.strategy";
import { ConfigModule } from "@nestjs/config";
import { UserService } from "src/user/user.service";

@Module({
	imports: [ConfigModule],
	controllers: [AuthController],
	providers: [UserService, AuthStrategy, AuthService],
})
export class AuthModule {}
