import { IoAdapter } from "@nestjs/platform-socket.io";
import { INestApplicationContext } from "@nestjs/common";
import { Server, ServerOptions } from "socket.io";
import { CorsOptions } from "cors";

export class SocketIoAdapter extends IoAdapter {
	constructor(
		appOrHttpServer: INestApplicationContext,
		private readonly corsOptions: CorsOptions,
	) {
		super(appOrHttpServer);
	}

	create(port: number, options?: ServerOptions): Server {
		return super.create(port, {
			...options,
			cors: this.corsOptions,
		});
	}
}
