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
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { Inventory } from '@prisma/client';
import { InventoryInput } from './args/create.dto';
import { InventoryResponse } from './res/response';
import { QueryParamsDto } from './args/query-decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllInventory(@Query() query: QueryParamsDto): Promise<Inventory[]> {
    return this.inventoryService.all(query);
  }

  @Get('download-csv')
  @HttpCode(HttpStatus.OK)
  async downloadCSV(
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    return this.inventoryService.download_csv(res);
  }

  @Get(':inventory_id')
  @HttpCode(HttpStatus.OK)
  async getInventoryById(
    @Param('inventory_id') inventory_id: string,
  ): Promise<Inventory> {
    return this.inventoryService.detail(inventory_id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('product_image'))
  async createInventory(
    @Body() input: InventoryInput,
    @UploadedFile() product_image: Express.Multer.File,
  ): Promise<InventoryResponse> {
    return this.inventoryService.create(input, product_image);
  }

  @Post('parse-csv')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async parseCSVInventory(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<InventoryResponse> {
    return this.inventoryService.parse_csv(file);
  }

  @Post('as-draft')
  @HttpCode(HttpStatus.CREATED)
  async createAsDraft(
    @Body() input: InventoryInput,
  ): Promise<InventoryResponse> {
    return this.inventoryService.createAsDraft(input);
  }

  @Patch(':inventory_id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('product_image'))
  async updateInventory(
    @Body() input: InventoryInput,
    @UploadedFile() product_image: Express.Multer.File,
    @Param('inventory_id') inventory_id: string,
  ): Promise<InventoryResponse> {
    return this.inventoryService.update(input, inventory_id, product_image);
  }
}
