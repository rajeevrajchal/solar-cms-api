import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { VendorService } from './vendor.service';
import { Vendor } from '@prisma/client';
import { CreateVendorInput } from './args/create.dto';
import { VendorResponse } from './res/response';
import { SearchParamsDto } from 'src/dto/search-decorators';

@Controller('vendor')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllVendor(@Query() query: SearchParamsDto): Promise<Vendor[]> {
    return this.vendorService.getAllVendors(query);
  }

  @Get(':vendor_id')
  @HttpCode(HttpStatus.OK)
  async getVendorById(@Param('vendor_id') vendor_id: string): Promise<Vendor> {
    return this.vendorService.getVendorById(vendor_id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createVendor(
    @Body() project_input: CreateVendorInput,
  ): Promise<VendorResponse> {
    return this.vendorService.createVendor(project_input);
  }

  @Patch(':vendor_id')
  @HttpCode(HttpStatus.OK)
  async updateProject(
    @Param('vendor_id') vendor_id: string,
    @Body() input: Partial<CreateVendorInput>,
  ): Promise<VendorResponse> {
    return this.vendorService.updatedVendor(vendor_id, input);
  }
}
