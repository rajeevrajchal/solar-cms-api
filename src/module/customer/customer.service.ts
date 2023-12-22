import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import messages from 'src/constants/message.constant';
import { Role, User } from '@prisma/client';
import { CustomerResponse } from './dto/res/customer-response';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllCustomer(): Promise<User[]> {
    try {
      const customer = await this.prisma.user.findMany({
        where: {
          role: Role.CUSTOMER,
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
}
