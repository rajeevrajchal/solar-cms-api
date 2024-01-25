import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { Inventory } from '@prisma/client';
import { InventoryInput } from './args/create.dto';
import { InventoryResponse } from './res/response';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllInventory(): Promise<Inventory[]> {
    return this.inventoryService.all();
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

  @Post('as-draft')
  @HttpCode(HttpStatus.CREATED)
  async createAsDraft(
    @Body() input: InventoryInput,
  ): Promise<InventoryResponse> {
    return this.inventoryService.createAsDraft(input);
  }
}
