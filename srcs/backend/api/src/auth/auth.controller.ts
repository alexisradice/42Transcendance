import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { OAuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get()
  @UseGuards(OAuthGuard)
  async auth() {}

  @Get('callback')
  @UseGuards(OAuthGuard)
  callback(@Req() req: Request) {
    return this.authService.signIn(req);
  }
}
