import { Module } from '@nestjs/common';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { JwtAuthGuard } from 'src/middleware/guard/jwt-auth.guard';
import { RolesGuard } from 'src/middleware/guard/role.guard';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [VendorController],
  providers: [VendorService, PrismaService, RolesGuard, JwtAuthGuard],
})
export class VendorModule {}
