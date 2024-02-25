import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CustomerService, Service } from '@prisma/client';
import { QueryParamsDto } from 'src/dto/query-decorators';
import { FileService } from 'src/helpers/file.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly fileService: FileService,
  ) {}

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
        select: {
          id: true,
          name: true,
          amount: true,
          description: true,
          deletedAt: true,
          createdAt: true,
          updatedAt: true,
        },
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
          customer_service_configuration: {
            select: {
              service_configuration: {
                select: {
                  name: true,
                  amount: true,
                  description: true,
                },
              },
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
