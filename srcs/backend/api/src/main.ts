import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";
import { SocketIoAdapter } from "./SocketIoAdapter";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	app.enableCors({
		origin: configService.get("REDIRECT_URI"),
		credentials: true,
	});
	app.useWebSocketAdapter(
		new SocketIoAdapter(app, {
			origin: configService.get("REDIRECT_URI"),
			credentials: true,
		}),
	);
	app.use(cookieParser());
	app.useGlobalPipes(new ValidationPipe());
	await app.listen(3000);
}
bootstrap();
