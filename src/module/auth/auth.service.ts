import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as moment from 'moment';
import messages from 'src/constants/message.constant';
import { OtpService } from 'src/helpers/otp.service';
import { PasswordHashService } from 'src/helpers/password-hash.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserCheckerService } from './../../helpers/user-checker.service';
import { LogoutDto } from './dto/response/logout.response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly passwordHashService: PasswordHashService,
    private readonly prisma: PrismaService,
    private readonly userChecker: UserCheckerService,
    private readonly hashPassword: PasswordHashService,
    private readonly configService: ConfigService,
    private readonly mail: MailService,
    private readonly otp: OtpService,
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

    const access_token = this.jwtService.sign(tokenPayload, {
      expiresIn: '30d',
    });

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

  async reset_password(user: User, password: string): Promise<any> {
    try {
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
    } catch (_error) {
      throw new HttpException(
        messages.login_error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async refreshToken(user: User, refreshToken: string): Promise<any> {
    try {
      const dbUser: User = await this.userChecker.checkUserExist(user.email);
      if (!dbUser || !refreshToken) {
        throw new UnauthorizedException(messages.token_required);
      }

      const decoded = this.jwtService.decode(refreshToken);

      if (!decoded) {
        throw new ForbiddenException(messages.invalid_token);
      }

      const refreshTokenMatched = await this.hashPassword.hashCompare(
        refreshToken,
        dbUser.refresh_token,
      );

      if (!refreshTokenMatched) {
        throw new ForbiddenException(messages['access_denied']);
      }

      const tokenPayload = {
        email: dbUser?.email,
        username: dbUser?.email,
        sub: dbUser?.id,
      };

      const access_token = this.jwtService.sign(tokenPayload);

      return {
        access_token,
      };
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async forget_password(email: string): Promise<any> {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: {
          email: email,
        },
      });
      if (!user) throw new Error(messages.user_not_exist);
      const otp: any = this.otp.generateOtp();
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          otp: otp.code,
          otp_expiry: otp.otp_expiry,
        },
      });
      await this.mail.sendOTP({
        email: user.email,
        code: otp.code,
        opt_expiry: moment(otp.opt_expiry).format('YYYY-MM-DD HH:mm:ss'),
      });
      return {
        messages: messages.otp_sent,
      };
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async forget_password_otp(input: {
    email: string;
    otp: string;
  }): Promise<any> {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: {
          email: input.email,
        },
      });
      if (!user) throw new Error(messages.user_not_exist);

      const isExpireOtp = this.otp.isOtpExpired(user?.otp_expiry);
      if (input.otp !== user.otp || isExpireOtp) {
        throw new Error(messages.unauthorized);
      }

      const tokenPayload = {
        email: user?.email,
        username: user?.email,
        sub: user?.id,
      };
      const token = this.jwtService.sign(tokenPayload, {
        expiresIn: '2h',
      });
      const link = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;
      await this.mail.sendPasswordResetLink({
        email: user.email,
        link: link,
      });
      return {
        messages: messages.password_reset_link_sent,
        link: link,
      };
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async logout(user_id: string): Promise<LogoutDto> {
    try {
      await this.prisma.user.update({
        where: {
          id: user_id,
        },
        data: {
          refresh_token: null,
        },
      });
      return {
        message: messages['logout'],
      };
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
