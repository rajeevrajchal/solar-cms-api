import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { PrismaService } from '../prisma/prisma.service';
import { RolesGuard } from 'src/middleware/guard/role.guard';
import { JwtAuthGuard } from 'src/middleware/guard/jwt-auth.guard';

@Module({
  controllers: [CustomerController],
  providers: [CustomerService, PrismaService, RolesGuard, JwtAuthGuard],
})
export class CustomerModule {}
