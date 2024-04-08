import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import messages from 'src/constants/message.constant';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      usernameField: 'email',
    });
  }

  async canActivate(context: ExecutionContext) {
    try {
      await super.canActivate(context);
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw new UnauthorizedException(messages.invalid_or_expired_token);
      }
      throw err;
    }
  }
}
