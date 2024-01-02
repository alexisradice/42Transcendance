import { Module } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { ChatGateway } from "./chat.gateway";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/user/user.service";
import { ChannelService } from "src/channel/channel.service";
import { ChatService } from './chat.service';

@Module({
	controllers: [ChatController],
	providers: [ChatGateway, JwtService, UserService, ChannelService, ChatService],
})
export class ChatModule {}
