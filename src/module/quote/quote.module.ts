import { Module, forwardRef } from '@nestjs/common';
import { FileService } from 'src/helpers/file.service';
import { SlugService } from 'src/helpers/slug-generator.service';
import { JwtAuthGuard } from 'src/middleware/guard/jwt-auth.guard';
import { RolesGuard } from 'src/middleware/guard/role.guard';
import { MailService } from '../mail/mail.service';
import { OrderModule } from '../order/order.module';
import { PrismaService } from '../prisma/prisma.service';
import { QuoteController } from './quote.controller';
import { QuoteService } from './quote.service';

@Module({
  imports: [forwardRef(() => OrderModule)],
  controllers: [QuoteController],
  providers: [
    MailService,
    JwtAuthGuard,
    PrismaService,
    RolesGuard,
    QuoteService,
    SlugService,
    FileService,
  ],
  exports: [QuoteService],
})
export class QuoteModule {}
