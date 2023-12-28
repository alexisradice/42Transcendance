import { Injectable } from '@nestjs/common';

import { Socket } from 'socket.io';
import { UserService } from '../user/user.service';

@Injectable()
export class RoomsService {
	constructor(
		//private userService: UserService,
	  ) {}
	
	  testFunction(socket: Socket): void {
		socket.emit('response', "hello");
	  }
}
