import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Order } from '@prisma/client';
import { QueryParamsDto } from 'src/dto/query-decorators';
import { PrismaService } from '../prisma/prisma.service';
import { QuoteService } from '../quote/quote.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quoteService: QuoteService,
  ) {}

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
}
