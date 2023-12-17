import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserCheckerService } from 'src/helpers/user-checker.service';
import messages from 'src/constants/message.constant';
import { Role } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private userCheckService: UserCheckerService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.userCheckService.checkUserExist(payload.email);
    if (user.is_temp && user.role !== Role.CUSTOMER) {
      throw new UnauthorizedException({
        message: messages.change_your_password_first,
        challenge: 'user_first_login',
      });
    }
    if (!user.is_active) {
      throw new UnauthorizedException(messages.user_not_active);
    }
    return user;
  }
}
