import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OAuthStrategy } from './strategies/oauth.strategy';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  providers: [ConfigService, UserService, OAuthStrategy, AuthService, JwtService],
})
export class AuthModule {}
