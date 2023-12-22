import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { PrismaService } from '../prisma/prisma.service';
import { RolesGuard } from 'src/middleware/guard/role.guard';
import { JwtAuthGuard } from 'src/middleware/guard/jwt-auth.guard';
import { UserCheckerService } from 'src/helpers/user-checker.service';
import { SlugService } from 'src/helpers/slug-generator.service';

@Module({
  controllers: [ProjectController],
  providers: [
    ProjectService,
    PrismaService,
    RolesGuard,
    JwtAuthGuard,
    UserCheckerService,
    SlugService,
  ],
})
export class ProjectModule {}
