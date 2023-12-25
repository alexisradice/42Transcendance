import { Module } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { UserModule } from "src/user/user.module";
import { UserService } from "src/user/user.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthStrategy } from "./auth.strategy";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtRefreshMiddleware } from "./jwtRefresh.middleware";

@Module({
	imports: [
		UserModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				global: true,
				secretOrPrivateKey: configService.get<string>("JWT_SECRET"),
				signOptions: {
					expiresIn: "15m",
				},
			}),
			inject: [ConfigService],
		}),
	],
	controllers: [AuthController],
	providers: [UserService, JwtService, AuthService, AuthStrategy],
	exports: [AuthService],
})
export class AuthModule {}
