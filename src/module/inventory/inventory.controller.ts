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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { InventoryService } from './inventory.service';
import { Inventory } from '@prisma/client';
import { InventoryInput } from './args/create.dto';
import { InventoryResponse } from './res/response';
import { QueryParamsDto } from './args/query-decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'stream';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllInventory(@Query() query: QueryParamsDto): Promise<Inventory[]> {
    return this.inventoryService.all(query);
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
  async createInventory(
    @Body() input: InventoryInput,
  ): Promise<InventoryResponse> {
    return this.inventoryService.create(input);
  }

  @Post('parse-csv')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async parseCSVInventory(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<InventoryResponse> {
    return this.inventoryService.parse_csv(file);
  }

  @Get('download-csv')
  @HttpCode(HttpStatus.OK)
  async downloadCSV(@Res() res: Response): Promise<any> {
    const data: any = this.inventoryService.download_csv();
    const stream = new Readable();

    stream.push(data.file);
    stream.push(null);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${data.filename}`,
    );
    return stream.pipe(res);
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
  async updateInventory(
    @Body() input: InventoryInput,
    @Param('inventory_id') inventory_id: string,
  ): Promise<InventoryResponse> {
    return this.inventoryService.update(input, inventory_id);
  }
}
