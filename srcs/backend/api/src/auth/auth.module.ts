import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OAuthStrategy } from './oauth.strategy';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [AuthController],
  providers: [ConfigService, UserService, OAuthStrategy, AuthService],
})
export class AuthModule {}
