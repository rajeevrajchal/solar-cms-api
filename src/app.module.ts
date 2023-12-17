import { Module } from '@nestjs/common';

import { PrismaService } from './module/prisma/prisma.service';
import { UserModule } from './module/user/user.module';
import { AuthModule } from './module/auth/auth.module';
import { MailModule } from './module/mail/mail.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // no need to import into other modules
    }),
    UserModule,
    AuthModule,
    MailModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
