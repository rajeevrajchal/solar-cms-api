import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SlugService } from 'src/helpers/slug-generator.service';
import { SolarService } from 'src/helpers/solar.service';
import { UserCheckerService } from 'src/helpers/user-checker.service';
import { JwtAuthGuard } from 'src/middleware/guard/jwt-auth.guard';
import { RolesGuard } from 'src/middleware/guard/role.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

@Module({
  imports: [],
  controllers: [ProjectController],
  providers: [
    ProjectService,
    PrismaService,
    CloudinaryService,
    RolesGuard,
    JwtAuthGuard,
    UserCheckerService,
    SlugService,
    MailService,
    SolarService,
    ConfigService,
  ],
})
export class ProjectModule {}
