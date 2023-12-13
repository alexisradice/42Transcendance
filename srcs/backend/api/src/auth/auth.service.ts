import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  signin() {
    return { msg: 'I am signin in' };
  }

  signup() {
    return { msg: 'I have signed up' };
  }
}
