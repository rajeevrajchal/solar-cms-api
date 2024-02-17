import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectService } from '../project/project.service';
import { UserCheckerService } from 'src/helpers/user-checker.service';
import { SlugService } from 'src/helpers/slug-generator.service';
import { MailService } from '../mail/mail.service';
import { SolarService } from 'src/helpers/solar.service';
import { QuoteService } from '../quote/quote.service';
import { FileService } from 'src/helpers/file.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  controllers: [PublicController],
  providers: [
    PublicService,
    PrismaService,
    ProjectService,
    ProjectService,
    PrismaService,
    UserCheckerService,
    SlugService,
    MailService,
    SolarService,
    QuoteService,
    FileService,
    CloudinaryService,
  ],
})
export class PublicModule {}
