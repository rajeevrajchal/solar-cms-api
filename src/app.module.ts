import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

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
import { CloudinaryModule } from './module/cloudinary/cloudinary.module';
import { QuoteModule } from './module/quote/quote.module';
import { CloudinaryProvider } from './module/cloudinary/cloudinary.provider';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // no need to import into other modules
    }),
    MulterModule.register(),
    UserModule,
    AuthModule,
    MailModule,
    CustomerModule,
    ProjectModule,
    PublicModule,
    VendorModule,
    InventoryModule,
    CloudinaryModule,
    QuoteModule,
  ],
  providers: [
    PrismaService,
    CloudinaryProvider,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
