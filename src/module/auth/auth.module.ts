import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { LocalStrategy } from 'src/middleware/strategy/local.strategy';
import { ValidateUser } from 'src/helpers/validate-user.service';
import { UserCheckerService } from 'src/helpers/user-checker.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtStrategy } from 'src/middleware/strategy/jwt.strategy';
import { PasswordHashService } from 'src/helpers/password-hash.service';
import { LocalResetStrategy } from 'src/middleware/strategy/local-reset.gurad';
import { JwtRefreshStrategy } from 'src/middleware/strategy/jwt-auth-refresh.strategy';
import { MailService } from '../mail/mail.service';
import { OtpService } from 'src/helpers/otp.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}`,
        },
      }),
    }),
    PassportModule,
  ],
  providers: [
    PrismaService,
    ValidateUser,
    UserCheckerService,
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    LocalResetStrategy,
    PasswordHashService,
    MailService,
    ConfigService,
    OtpService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
