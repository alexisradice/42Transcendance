import {
	MiddlewareConsumer,
	Module,
	NestModule,
	RequestMethod,
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { MessageModule } from "./message/message.module";
import { PrismaModule } from "./prisma/prisma.module";
import { UserModule } from "./user/user.module";
import { JwtRefreshMiddleware } from "./auth/jwtRefresh.middleware";
import { JwtService } from "@nestjs/jwt";
import { ChannelModule } from './channel/channel.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		AuthModule,
		UserModule,
		MessageModule,
		PrismaModule,
		ChannelModule,
	],
	controllers: [AppController],
	providers: [AppService, JwtService],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(JwtRefreshMiddleware)
			.exclude({ path: "auth/login", method: RequestMethod.POST })
			.forRoutes("*");
	}
}
