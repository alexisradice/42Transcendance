import { Module } from "@nestjs/common";
import { RoomsService } from "./rooms.service";
import { RoomsGateway } from "./rooms.gateway";
import { UserService } from "../user/user.service";

@Module({
	providers: [RoomsService, RoomsGateway, UserService],
})
export class RoomsModule {}
