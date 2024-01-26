import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Inventory, InventoryStatus } from '@prisma/client';
import { InventoryInput } from './args/create.dto';
import { InventoryResponse } from './res/response';
import messages from 'src/constants/message.constant';
import { QueryParamsDto } from './args/query-decorators';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async all(query?: QueryParamsDto): Promise<Inventory[]> {
    try {
      const { vendor, search, category } = query;
      const where: any = {
        deletedAt: null,
        NOT: {
          status: InventoryStatus.REMOVED,
        },
        category: category,
        vendor_id: vendor,
      };

      if (search) {
        where.name = {
          contains: search,
          mode: 'insensitive',
        };
      }

      const inventories = await this.prisma.inventory.findMany({
        where,
        include: {
          vendor: true,
        },
        take: Number(query?.limit) || 10,
        skip: Number(query?.offset) || 0,
      });

      return inventories;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async detail(inventory_id: string): Promise<Inventory> {
    try {
      const inventory = await this.prisma.inventory.findFirst({
        where: {
          id: inventory_id,
        },
        include: {
          vendor: true,
        },
      });
      return inventory;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async create(payload: InventoryInput): Promise<InventoryResponse> {
    try {
      const inventory = await this.prisma.inventory.create({
        data: {
          ...payload,
          status: InventoryStatus.ACTIVE,
        } as any,
      });
      return {
        message: messages.inventory_created,
        inventory,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createAsDraft(payload: InventoryInput): Promise<InventoryResponse> {
    try {
      const inventory = await this.prisma.inventory.create({
        data: {
          ...payload,
          status: InventoryStatus.DRAFT,
        } as any,
      });
      return {
        message: messages.inventory_created,
        inventory,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(
    payload: InventoryInput,
    inventory_id: string,
  ): Promise<InventoryResponse> {
    try {
      const inventory = await this.prisma.inventory.update({
        where: {
          id: inventory_id,
        },
        data: payload as any,
      });
      return {
        message: messages.inventory_created,
        inventory,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
