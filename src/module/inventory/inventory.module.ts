import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from 'src/middleware/guard/jwt-auth.guard';
import { RolesGuard } from 'src/middleware/guard/role.guard';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService, PrismaService, RolesGuard, JwtAuthGuard],
})
export class InventoryModule {}
