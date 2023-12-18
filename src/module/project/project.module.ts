import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { PrismaService } from '../prisma/prisma.service';
import { RolesGuard } from 'src/middleware/guard/role.guard';
import { JwtAuthGuard } from 'src/middleware/guard/jwt-auth.guard';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService, PrismaService, RolesGuard, JwtAuthGuard],
})
export class ProjectModule {}
