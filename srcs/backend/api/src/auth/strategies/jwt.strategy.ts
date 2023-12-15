import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import config from '../../config/config';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { User } from '../../users/entities/user.entity';

export type JwtPayload = {
  sub: string;
  email: string;
};

const extractJwtFromCookie = (req: any) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['access_token'];
  }
  return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    const secretOrKey = configService.get<string>('JWT_SECRET');
    super({
      ignoreExpiration: false,
      secretOrKey,
      jwtFromRequest: extractJwtFromCookie,
    });
  }

  async validate(payload: JwtPayload) {
    // const user = await this.userRepository.findOne({ id: payload.sub });

    // if (!user) throw new UnauthorizedException('Please log in to continue');
    const { sub, email } = payload;

    return {
      sub,
      email,
    };
  }
}
