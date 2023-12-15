import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// import { generateFromEmail } from 'unique-username-generator';
// import { User } from '../users/entities/user.entity';
// import { RegisterUserDto } from './dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  generateJwt(payload) {
    return this.jwtService.sign(payload);
  }

  async signIn(user) {
    // if (!user) {
    //   throw new BadRequestException('Unauthenticated');
    // }

    // const userExists = await this.findUserByEmail(user.email);

    // if (!userExists) {
    //   return this.registerUser(user);
    // }

    return this.generateJwt({
      sub: user.sub,
      email: user.email,
    });
  }

  // async registerUser(user: RegisterUserDto) {
  //   try {
  //     const newUser = this.userRepository.create(user);
  //     newUser.username = generateFromEmail(user.email, 5);

  //     await this.userRepository.save(newUser);

  //     return this.generateJwt({
  //       sub: newUser.id,
  //       email: newUser.email,
  //     });
  //   } catch {
  //     throw new InternalServerErrorException();
  //   }
  // }

  // async findUserByEmail(email) {
  //   const user = await this.userRepository.findOne({ email });

  //   if (!user) {
  //     return null;
  //   }

  //   return user;
  // }
}
