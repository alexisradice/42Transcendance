import { Injectable } from '@nestjs/common';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UserService {
  async findOrCreate(userProfile: any) {
    console.log('userProfile.name', userProfile.name);
    // insert user in DB
  }
}
