import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserCheckerService } from 'src/helpers/user-checker.service';
import messages from 'src/constants/message.constant';

@Injectable()
export class LocalResetStrategy extends PassportStrategy(
  Strategy,
  'reset_password',
) {
  constructor(readonly userCheckerService: UserCheckerService) {
    super({
      usernameField: 'email',
      passReqToCallback: true,
    });
  }

  async validate(req: any): Promise<any> {
    const { email, token, password } = req.body;

    const user = await this.userCheckerService.checkUserExist(email);
    if (!user) {
      throw new UnauthorizedException(messages.user_exist);
    }
    if (!user?.reset_token && user?.reset_token !== token) {
      throw new UnauthorizedException(messages.token_invalid);
    }

    return {
      user,
      password: password,
    };
  }
}
