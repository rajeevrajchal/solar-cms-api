import { Module, forwardRef } from '@nestjs/common';
import { FileService } from 'src/helpers/file.service';
import { SlugService } from 'src/helpers/slug-generator.service';
import { JwtAuthGuard } from 'src/middleware/guard/jwt-auth.guard';
import { RolesGuard } from 'src/middleware/guard/role.guard';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { QuoteService } from '../quote/quote.service';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [forwardRef(() => OrderModule)],
  controllers: [OrderController],
  providers: [
    OrderService,
    QuoteService,
    JwtAuthGuard,
    PrismaService,
    RolesGuard,
    SlugService,
    MailService,
    FileService,
  ],
  exports: [OrderService, JwtAuthGuard, PrismaService, RolesGuard],
})
export class OrderModule {}
