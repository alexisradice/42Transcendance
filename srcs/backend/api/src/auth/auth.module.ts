import { Module } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { UserModule } from "src/user/user.module";
import { UserService } from "src/user/user.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
	imports: [
		UserModule,
		JwtModule.register({
			global: true,
			signOptions: {
				expiresIn: "60s",
			},
		}),
	],
	controllers: [AuthController],
	providers: [UserService, JwtService, AuthService],
	exports: [AuthService],
})
export class AuthModule {}
