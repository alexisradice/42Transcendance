import { Module } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { ChatGateway } from "./chat.gateway";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/user/user.service";

@Module({
	controllers: [ChatController],
	providers: [ChatGateway, JwtService, UserService],
})
export class ChatModule {}
