import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  providers: [AuthResolver, AuthService],
})
export class AuthModule {}
