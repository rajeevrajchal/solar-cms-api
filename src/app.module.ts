import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AllExceptionsFilter } from './exception/exception';
import { AuthModule } from './module/auth/auth.module';
import { CloudinaryModule } from './module/cloudinary/cloudinary.module';
import { CloudinaryProvider } from './module/cloudinary/cloudinary.provider';
import { CustomerModule } from './module/customer/customer.module';
import { HomeModule } from './module/home/home.module';
import { InventoryModule } from './module/inventory/inventory.module';
import { MailModule } from './module/mail/mail.module';
import { OrderModule } from './module/order/order.module';
import { PrismaService } from './module/prisma/prisma.service';
import { ProjectModule } from './module/project/project.module';
import { PublicModule } from './module/public/public.module';
import { QuoteModule } from './module/quote/quote.module';
import { ServiceModule } from './module/service/service.module';
import { UserModule } from './module/user/user.module';
import { VendorModule } from './module/vendor/vendor.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // no need to import into other modules
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
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
    ServiceModule,
    OrderModule,
    HomeModule,
  ],
  providers: [
    PrismaService,
    CloudinaryProvider,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
