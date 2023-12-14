import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';

@Injectable()
export class OAuthStrategy extends PassportStrategy(Strategy, 'oauth') {
  constructor(
    configService: ConfigService,
    private readonly userService: UserService,
  ) {
    const clientID = configService.get<string>('UID_OAUTH');
    const clientSecret = configService.get<string>('SECRET_OAUTH');
    const callbackURL = configService.get<string>('REDIRECT_URL_OAUTH');
    super({
      // Put config in `.env`
      authorizationURL: `https://api.intra.42.fr/oauth/authorize/client_id=${clientID}&redirect_uri=${callbackURL}&response_type=code&scope=public`,
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID,
      clientSecret,
      callbackURL,
      scope: ['public'],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: any) {
    return profile;
  }
}
