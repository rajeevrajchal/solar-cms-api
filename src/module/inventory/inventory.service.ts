import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Inventory, InventoryStatus } from '@prisma/client';
import { InventoryInput } from './args/create.dto';
import { InventoryResponse } from './res/response';
import messages from 'src/constants/message.constant';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async all(): Promise<Inventory[]> {
    try {
      const inventory = await this.prisma.inventory.findMany({
        where: {
          deletedAt: null,
          NOT: {
            status: InventoryStatus.REMOVED,
          },
        },
      });
      return inventory;
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
}
