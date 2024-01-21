import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import messages from 'src/constants/message.constant';
import { Role, User } from '@prisma/client';
import { CustomerResponse } from './dto/res/customer-response';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllCustomer(): Promise<Partial<User>[]> {
    try {
      const customer = await this.prisma.user.findMany({
        where: {
          role: Role.CUSTOMER,
          is_active: true,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          type: true,
          location: true,
          phone: true,
          otp: true,
          is_active: true,
          deletedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return customer;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getSingleCustomer(customer_id: string): Promise<User> {
    try {
      const customer = await this.prisma.user.findFirstOrThrow({
        where: {
          id: customer_id,
        },
        include: {
          project: {
            where: {
              deletedAt: null,
            },
          },
        },
      });
      return customer;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createCustomer(customer_input: any): Promise<CustomerResponse> {
    try {
      const param = {
        name: customer_input.name,
        email: customer_input.email,
        password: '',
        role: Role.CUSTOMER,
        phone: customer_input.phone,
        location: customer_input.location,
        is_active: true,
        is_temp: false,
      };
      const customer = await this.prisma.user.upsert({
        where: { email: customer_input.email, role: Role.CUSTOMER },
        update: param,
        create: param,
      });
      return {
        message: messages.customer_created,
        customer: customer,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteCustomer(customer_id: string): Promise<CustomerResponse> {
    try {
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: customer_id },
          data: { deletedAt: new Date(), is_active: false },
        }),
        this.prisma.project.updateMany({
          where: { customer_id: customer_id },
          data: { deletedAt: new Date() },
        }),
        this.prisma.quote.updateMany({
          where: { customer_id: customer_id },
          data: { deletedAt: new Date() },
        }),
      ]);
      return {
        message: messages.customer_deleted,
        customer: null,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
