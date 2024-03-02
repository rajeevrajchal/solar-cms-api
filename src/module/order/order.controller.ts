import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Order, Role } from '@prisma/client';
import { HasRoles } from 'src/decorators/role.decorator';
import { JwtAndRolesGuard } from 'src/middleware/guard/jwt-auth-role.guard';
import { QueryParamsDto } from '../inventory/args/query-decorators';
import { OrderService } from './order.service';

@UseGuards(JwtAndRolesGuard)
@HasRoles(Role.SALE, Role.ENGINEER)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllProject(@Query() query: QueryParamsDto): Promise<Order[]> {
    return this.orderService.all(query);
  }

  @Get(':order_id')
  async getSingleProject(@Param('order_id') order_id: string): Promise<Order> {
    return this.orderService.find(order_id);
  }
}
