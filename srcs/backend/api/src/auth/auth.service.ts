import { Injectable } from "@nestjs/common";
import { Req } from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class AuthService {
	constructor() {}

	async signIn(@Req() req: Request) {
		return req.user;
	}
}
