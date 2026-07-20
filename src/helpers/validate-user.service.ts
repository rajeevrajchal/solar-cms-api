import { Global, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserCheckerService } from './user-checker.service';
import * as bcrypt from 'bcryptjs';
import messages from 'src/constants/message.constant';

@Global()
@Injectable()
export class ValidateUser {
  constructor(private readonly userChecker: UserCheckerService) {}

  async validateLoginUser(email: string, password: string): Promise<any> {
    try {
      const loginUser: any = await this.userChecker.checkUserExist(email);

      if (!loginUser) {
        throw new UnauthorizedException(messages['email_password_invalid']);
      }

      const passwordValid: boolean = await bcrypt.compare(
        password,
        loginUser.password,
      );
      if (passwordValid) {
        return loginUser;
      }
      return null as any;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
