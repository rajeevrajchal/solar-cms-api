import { Module } from '@nestjs/common';
import { FileService } from 'src/helpers/file.service';
import { JwtAuthGuard } from 'src/middleware/guard/jwt-auth.guard';
import { RolesGuard } from 'src/middleware/guard/role.guard';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';

@Module({
  controllers: [ServiceController],
  providers: [
    JwtAuthGuard,
    RolesGuard,
    ServiceService,
    MailService,
    PrismaService,
    FileService,
  ],
})
export class ServiceModule {}
