import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { PrismaService } from '../prisma/prisma.service';
import { RolesGuard } from 'src/middleware/guard/role.guard';
import { JwtAuthGuard } from 'src/middleware/guard/jwt-auth.guard';
import { UserCheckerService } from 'src/helpers/user-checker.service';
import { SlugService } from 'src/helpers/slug-generator.service';
import { MailService } from '../mail/mail.service';
import { SolarService } from 'src/helpers/solar.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

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
  ],
})
export class ProjectModule {}
