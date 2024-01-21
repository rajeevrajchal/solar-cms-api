import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerResponse } from './dto/res/customer-response';
import { CustomerInput } from './dto/arg/customer_input.dto';
import { HasRoles } from 'src/decorators/role.decorator';
import { JwtAndRolesGuard } from 'src/middleware/guard/jwt-auth-role.guard';
import { Role, User } from '@prisma/client';

@UseGuards(JwtAndRolesGuard)
@HasRoles(Role.SALE, Role.ENGINEER, Role.ADMIN)
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllCustomer(): Promise<Partial<User>[]> {
    return this.customerService.getAllCustomer();
  }

  @Get(':customer_id')
  @HttpCode(HttpStatus.OK)
  async getSingleCustomer(
    @Param('customer_id') customer_id: string,
  ): Promise<Partial<User>> {
    return this.customerService.getSingleCustomer(customer_id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCustomer(
    @Body() customer_input: CustomerInput,
  ): Promise<CustomerResponse> {
    return this.customerService.createCustomer(customer_input);
  }

  @Delete(':customer_id')
  @HttpCode(HttpStatus.OK)
  async deleteCustomer(
    @Param('customer_id') customer_id: string,
  ): Promise<CustomerResponse> {
    return this.customerService.deleteCustomer(customer_id);
  }
}
