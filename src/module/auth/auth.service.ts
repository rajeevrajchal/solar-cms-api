import { PasswordHashService } from 'src/helpers/password-hash.service';
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import messages from 'src/constants/message.constant';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly passwordHashService: PasswordHashService,
    private readonly prisma: PrismaService,
  ) {}

  async login(req: any): Promise<any> {
    const user = req?.user;

    if (!user) {
      throw new UnauthorizedException(messages['email_password_invalid']);
    }

    const tokenPayload = {
      email: user?.email,
      username: user?.email,
      sub: user?.id,
    };

    const access_token = this.jwtService.sign(tokenPayload);

    if (user.is_temp) {
      const reset_token = this.jwtService.sign(tokenPayload, {
        expiresIn: '2h',
      });

      await this.prisma.user.update({
        where: {
          id: user?.id,
        },
        data: {
          reset_token: reset_token,
        },
      });

      return {
        message: messages.user_not_active,
        challenge: 'user_first_login',
        token: reset_token,
      };
    }

    const refresh_token = this.jwtService.sign(tokenPayload, {
      expiresIn: '7d',
    });

    await this.prisma.user.update({
      where: {
        id: user?.id,
      },
      data: {
        refresh_token: await this.passwordHashService.hashData(refresh_token),
      },
    });

    return {
      access_token: access_token,
      refresh_token: refresh_token,
      user,
    };
  }

  async reset_password(req: any): Promise<any> {
    try {
      const { user, password } = req?.user;
      const hashPassword = await this.passwordHashService.hashData(password);
      await this.prisma.user.update({
        where: {
          id: user?.id,
        },
        data: {
          password: hashPassword,
          is_active: true,
          is_temp: false,
          reset_token: null,
        },
      });
      return {
        messages: messages.password_changed,
      };
    } catch (error) {
      throw new HttpException(
        messages.login_error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sayHello(): Promise<any> {
    return 'hello';
  }
}
