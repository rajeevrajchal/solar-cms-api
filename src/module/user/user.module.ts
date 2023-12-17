import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserCheckerService } from 'src/helpers/user-checker.service';
import { PasswordHashService } from 'src/helpers/password-hash.service';
import { PasswordGeneratorService } from 'src/helpers/password-generator.service';
import { UserController } from './user.controller';
import { RolesGuard } from 'src/middleware/guard/role.guard';
import { JwtAuthGuard } from 'src/middleware/guard/jwt-auth.guard';
import { MailService } from '../mail/mail.service';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    PrismaService,
    PrismaService,
    UserCheckerService,
    PasswordHashService,
    PasswordGeneratorService,
    RolesGuard,
    JwtAuthGuard,
    MailService,
  ],
})
export class UserModule {}
