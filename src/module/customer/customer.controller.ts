import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerResponse } from './dto/res/customer-response';
import { CustomerInput } from './dto/arg/customer_input.dto';
import { HasRoles } from 'src/decorators/role.decorator';
import { JwtAndRolesGuard } from 'src/middleware/guard/jwt-auth-role.guard';
import { Role, User } from '@prisma/client';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAndRolesGuard)
  @HasRoles(Role.SALE)
  async getAllCustomer(): Promise<User[]> {
    return this.customerService.getAllCustomer();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAndRolesGuard)
  @HasRoles(Role.SALE)
  async createCustomer(
    @Body() customer_input: CustomerInput,
  ): Promise<CustomerResponse> {
    return this.customerService.createCustomer(customer_input);
  }
}
