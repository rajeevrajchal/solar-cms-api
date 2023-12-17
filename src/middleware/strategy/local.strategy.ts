import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ValidateUser } from 'src/helpers/validate-user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private validateUserService: ValidateUser) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  async validate(_, email: string, password: string): Promise<any> {
    const user = await this.validateUserService.validateLoginUser(
      email,
      password,
    );
    return user;
  }
}
