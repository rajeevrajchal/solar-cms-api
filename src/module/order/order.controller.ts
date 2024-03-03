import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Order, Role } from '@prisma/client';
import { HasRoles } from 'src/decorators/role.decorator';
import { JwtAndRolesGuard } from 'src/middleware/guard/jwt-auth-role.guard';
import { QueryParamsDto } from '../inventory/args/query-decorators';
import { OrderStatusChange } from './dto/order-status-change';
import { UpdateOrder } from './dto/update-order';
import { OrderService } from './order.service';

@UseGuards(JwtAndRolesGuard)
@HasRoles(Role.SALE)
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

  @Patch(':order_id')
  async updateOrderPayment(
    @Param('order_id') order_id: string,
    @Body() input: UpdateOrder,
  ): Promise<Order> {
    return this.orderService.updateOrderPayment(order_id, input);
  }

  @Patch('change-status/:order_id/:status_type')
  async changeStatus(
    @Param('order_id') order_id: string,
    @Param('status_type') status_type: string,
    @Body() input: OrderStatusChange,
  ): Promise<Order> {
    return this.orderService.changeStatus(order_id, status_type, input);
  }
}
