import { Module } from '@nestjs/common';

import { PrismaService } from './module/prisma/prisma.service';
import { UserModule } from './module/user/user.module';
import { AuthModule } from './module/auth/auth.module';
import { MailModule } from './module/mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './exception/exception';
import { CustomerModule } from './module/customer/customer.module';
import { ProjectModule } from './module/project/project.module';
import { PublicModule } from './module/public/public.module';
import { VendorModule } from './module/vendor/vendor.module';
import { InventoryModule } from './module/inventory/inventory.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // no need to import into other modules
    }),
    UserModule,
    AuthModule,
    MailModule,
    CustomerModule,
    ProjectModule,
    PublicModule,
    VendorModule,
    InventoryModule,
  ],
  providers: [
    PrismaService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
