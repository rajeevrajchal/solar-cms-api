import {
  HttpException,
  HttpStatus,
  Injectable,
  StreamableFile,
} from '@nestjs/common';

import { Inventory, InventoryStatus } from '@prisma/client';
import { Response } from 'express';
import { omit } from 'lodash';
import messages from 'src/constants/message.constant';
import { CsvService } from 'src/helpers/csv.service';
import { FileService } from 'src/helpers/file.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryInput } from './args/create.dto';
import { QueryParamsDto } from './args/query-decorators';
import { InventoryResponse } from './res/response';

const directoryPath = 'src/public/temporary-files';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly csvParse: CsvService,
    private readonly fileService: FileService,
    private readonly cloudinary: CloudinaryService,
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

  async create(
    payload: InventoryInput,
    product_image: Express.Multer.File,
  ): Promise<InventoryResponse> {
    try {
      const inventory = await this.prisma.inventory.create({
        data: {
          ...payload,
          status: InventoryStatus.ACTIVE,
          watt: +payload.watt,
          voltage: +payload.voltage,
          ampere: +payload.ampere,
          buying_cost: +payload.buying_cost,
          selling_cost: +payload.selling_cost,
          max_discount: +payload.max_discount,
          max_flat_discount: +payload.max_flat_discount,
        } as any,
      });
      let inventory_image = null;
      const folder_name = `studio/inventory/${inventory.id}/`;
      if (product_image) {
        inventory_image = await this.cloudinary.uploadFile(
          product_image,
          folder_name,
        );
      }
      await this.prisma.inventory.update({
        where: {
          id: inventory.id,
        },
        data: {
          product_image: inventory_image
            ? {
                url: inventory_image.url,
                id: inventory_image.public_id,
              }
            : null,
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
        ...omit(
          {
            ...row,
            watt: +row.watt,
            voltage: +row.voltage,
            ampere: +row.ampere,
            buying_cost: +row.buying_cost,
            selling_cost: +row.selling_cost,
            max_discount: +row.max_discount,
            max_flat_discount: +row.max_flat_discount,
          },
          ['createdAt', 'updatedAt', 'status', '__parsed_extra'],
        ),
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
    product_image: Express.Multer.File,
  ): Promise<InventoryResponse> {
    try {
      let inventory_image = null;
      const folder_name = `studio/inventory/${inventory_id}/`;
      if (product_image) {
        const inventory_data: any =
          await this.prisma.inventory.findFirstOrThrow({
            where: {
              id: inventory_id,
            },
          });
        if (inventory_data.product_image) {
          await this.cloudinary.deleteFile(inventory_data.product_image?.id);
        }
        inventory_image = await this.cloudinary.uploadFile(
          product_image,
          folder_name,
        );
      }

      const inventory = await this.prisma.inventory.update({
        where: {
          id: inventory_id,
        },
        data: {
          ...payload,
          product_image: inventory_image
            ? {
                url: inventory_image.url,
                id: inventory_image.public_id,
              }
            : null,
          watt: +payload.watt,
          voltage: +payload.voltage,
          ampere: +payload.ampere,
          buying_cost: +payload.buying_cost,
          selling_cost: +payload.selling_cost,
          max_discount: +payload.max_discount,
          max_flat_discount: +payload.max_flat_discount,
        } as any,
      });

      return {
        message: messages.inventory_created,
        inventory: inventory,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async removeImageFrom(): Promise<InventoryResponse> {
    try {
      return {
        message: messages.image_removed,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
