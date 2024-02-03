import {
  HttpException,
  HttpStatus,
  Injectable,
  StreamableFile,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { Inventory, InventoryStatus } from '@prisma/client';
import { InventoryInput } from './args/create.dto';
import { InventoryResponse } from './res/response';
import messages from 'src/constants/message.constant';
import { QueryParamsDto } from './args/query-decorators';
import { CsvService } from 'src/helpers/csv.service';
import { omit } from 'lodash';
import { Response } from 'express';
import { FileService } from 'src/helpers/file.service';

const directoryPath = 'src/public/temporary-files';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly csvParse: CsvService,
    private readonly fileService: FileService,
  ) {}

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

  async parse_csv(csv: Express.Multer.File): Promise<InventoryResponse> {
    try {
      const rows: any = await this.csvParse.parseCsv(csv);
      const payload = rows.map((row) => ({
        ...omit(row, ['createdAt', 'updatedAt', 'status', '__parsed_extra']),
      }));
      await this.prisma.inventory.createMany({
        data: payload,
      });
      return {
        message: messages.inventory_parsed,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async download_csv(res: Response): Promise<StreamableFile> {
    try {
      const inventories = await this.prisma.inventory.findMany({
        where: {
          deletedAt: null,
          NOT: {
            status: InventoryStatus.REMOVED,
          },
        },
        select: {
          name: true,
          category: true,
          watt: true,
          voltage: true,
          ampere: true,
          buying_cost: true,
          selling_cost: true,
          max_flat_discount: true,
          max_discount: true,
          createdAt: true,
          updatedAt: true,
          vendor: true,
        },
      });
      const data = await this.csvParse.jsonToCSV(
        inventories.map((item) => ({
          ...omit(item, ['vendor']),
          vendor: item?.vendor?.name,
        })),
      );
      const filename = `inventory-${new Date().toISOString()}.csv`;
      return this.fileService.streamAndDeleteFile(
        directoryPath,
        filename,
        data,
        res,
      );
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
