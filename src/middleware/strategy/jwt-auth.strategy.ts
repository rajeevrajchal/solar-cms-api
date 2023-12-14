import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from 'src/constants/jwt.constant';
import { AuthService } from 'src/modules/auth/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
      usernameField: 'email',
      logging: true,
    });
  }

  async validate(payload: any) {
    const user = await this.authService.whoAmI({
      user_id: payload.sub,
      email: payload.username,
    });
    return {
      user_id: payload.sub,
      email: payload.username,
      role: user?.role,
    };
  }
}
