import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from 'src/constants/jwt.constant';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          return req?.body?.variables?.refreshInput?.refresh_token || req.body;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
      usernameField: 'email',
      logging: true,
    });
  }

  async validate(payload: any) {
    return payload;
  }
}
