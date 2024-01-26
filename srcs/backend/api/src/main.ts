import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";
import { SocketIoAdapter } from "./SocketIoAdapter";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors({
		origin: true,
		credentials: true,
	});
	app.useWebSocketAdapter(
		new SocketIoAdapter(app, {
			origin: true,
			credentials: true,
		}),
	);
	app.use(cookieParser());
	app.useGlobalPipes(new ValidationPipe());
	await app.listen(3000);
}
bootstrap();
