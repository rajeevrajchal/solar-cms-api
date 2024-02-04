import { Module } from '@nestjs/common';
import { QuoteController } from './quote.controller';
import { QuoteService } from './quote.service';
import { MailService } from '../mail/mail.service';
import { JwtAuthGuard } from 'src/middleware/guard/jwt-auth.guard';
import { RolesGuard } from 'src/middleware/guard/role.guard';
import { PrismaService } from '../prisma/prisma.service';
import { SlugService } from 'src/helpers/slug-generator.service';
import { FileService } from 'src/helpers/file.service';

@Module({
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
})
export class QuoteModule {}
