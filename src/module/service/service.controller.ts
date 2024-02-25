import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CustomerService, Service } from '@prisma/client';
import { JwtAndRolesGuard } from 'src/middleware/guard/jwt-auth-role.guard';
import { QueryParamsDto } from '../inventory/args/query-decorators';
import { ServiceService } from './service.service';

@UseGuards(JwtAndRolesGuard)
@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async all(@Query() query: QueryParamsDto): Promise<Service[]> {
    return this.serviceService.all(query);
  }

  @Get('customer-configuration')
  @HttpCode(HttpStatus.OK)
  async booked(@Query() query: QueryParamsDto): Promise<CustomerService[]> {
    return this.serviceService.booked(query);
  }
}
