import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CustomerService, Service } from '@prisma/client';
import { QueryParamsDto } from 'src/dto/query-decorators';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServiceService {
  constructor(private readonly prisma: PrismaService) {}

  async all(query?: QueryParamsDto): Promise<Service[]> {
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

      const service = await this.prisma.service.findMany({
        where,
      });
      return service;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async booked(query?: QueryParamsDto): Promise<CustomerService[]> {
    try {
      const { status } = query;
      const where: any = {
        deletedAt: null,
        status: status ? status.toUpperCase() : status,
      } as any;
      const booked_service = await this.prisma.customerService.findMany({
        where,
        include: {
          customer: {
            select: {
              name: true,
              email: true,
              id: true,
              role: true,
              location: true,
              phone: true,
              type: true,
            },
          },
        },
      });
      return booked_service;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
