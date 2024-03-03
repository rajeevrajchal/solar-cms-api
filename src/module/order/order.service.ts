import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Order, OrderStatus } from '@prisma/client';
import { QueryParamsDto } from 'src/dto/query-decorators';
import { PrismaService } from '../prisma/prisma.service';
import { QuoteService } from '../quote/quote.service';
import { OrderStatusChange } from './dto/order-status-change';
import { UpdateOrder } from './dto/update-order';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quoteService: QuoteService,
  ) {}

  getStatus = (status: string) => {
    switch (status) {
      case 'on_hold':
        return OrderStatus.ON_HOLD;
      case 'canaled':
        return OrderStatus.CANALED;
      case 'ordered':
        return OrderStatus.ORDERED;
      case 'payment_done':
        return OrderStatus.PAYMENT_DONE;
      case 'pending':
        return OrderStatus.PENDING;
      default:
        throw new HttpException(
          'Status not defined',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
    }
  };

  async all(query?: QueryParamsDto): Promise<Order[]> {
    try {
      const { search, status } = query;
      const where: any = {
        deletedAt: null,
        status: status ? status.toUpperCase() : status,
      } as any;

      if (search) {
        where.name = {
          contains: search,
          mode: 'insensitive',
        };
      }

      return await this.prisma.order.findMany({
        where,
        include: {
          quote: true,
        },
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async find(order_id: string): Promise<Order> {
    try {
      return await this.prisma.order.findFirstOrThrow({
        where: {
          id: order_id,
        },
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateOrderPayment(
    order_id: string,
    input: UpdateOrder,
  ): Promise<Order> {
    try {
      const order = await this.find(order_id);
      return await this.prisma.order.update({
        where: {
          id: order_id,
        },
        data: {
          payment: input.full_payment ? 100 : input.payment,
          full_payment: input.payment === 100 ? true : input.full_payment,
          status:
            input.full_payment || input.payment === 100
              ? OrderStatus.PAYMENT_DONE
              : [OrderStatus.ON_HOLD, OrderStatus.CANALED].includes(
                    order.status.toUpperCase() as any,
                  )
                ? OrderStatus.ORDERED
                : order.status,
        },
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async changeStatus(
    order_id: string,
    status: string,
    input: OrderStatusChange,
  ): Promise<Order> {
    try {
      return await this.prisma.order.update({
        where: {
          id: order_id,
        },
        data: {
          reason: input.reason,
          status: this.getStatus(status),
        },
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
