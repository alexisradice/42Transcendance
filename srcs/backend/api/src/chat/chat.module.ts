import { Module } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { ChatGateway } from "./chat.gateway";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/user/user.service";
import { ChannelService } from "src/channel/channel.service";

@Module({
	controllers: [ChatController],
	providers: [ChatGateway, JwtService, UserService, ChannelService],
})
export class ChatModule {}
