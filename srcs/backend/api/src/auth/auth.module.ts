import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthStrategy } from "./auth.strategy";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UserService } from "src/user/user.service";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { UserModule } from "src/user/user.module";

@Module({
	imports: [
		ConfigModule,
		UserModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				global: true,
				secret: configService.get<string>("JWT_SECRET"),
				signOptions: { expiresIn: "60s" },
			}),
			inject: [ConfigService],
		}),
	],
	controllers: [AuthController],
	providers: [UserService, JwtService, AuthService],
	exports: [AuthService],
})
export class AuthModule {}
