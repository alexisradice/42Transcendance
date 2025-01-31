import {
	MiddlewareConsumer,
	Module,
	NestModule,
	RequestMethod,
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { MessageModule } from "./message/message.module";
import { PrismaModule } from "./prisma/prisma.module";
import { UserModule } from "./user/user.module";
import { JwtRefreshMiddleware } from "./auth/jwtRefresh.middleware";
import { JwtService } from "@nestjs/jwt";
import { ChannelModule } from "./channel/channel.module";
import { ChatModule } from "./chat/chat.module";
import { GameModule } from "./game/game.module";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		AuthModule,
		UserModule,
		MessageModule,
		PrismaModule,
		ChannelModule,
		ChatModule,
		GameModule,
	],
	controllers: [AppController],
	providers: [JwtService],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(JwtRefreshMiddleware)
			.exclude(
				{ path: "health", method: RequestMethod.GET },
				{ path: "auth/login", method: RequestMethod.POST },
			)
			.forRoutes("*");
	}
}
