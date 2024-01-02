import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtGuard } from "src/auth/jwtToken.guard";

@Controller("chat")
export class ChatController {}
