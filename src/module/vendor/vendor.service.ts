import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Vendor } from '@prisma/client';
import { CreateVendorInput } from './args/create.dto';
import { VendorResponse } from './res/response';
import messages from 'src/constants/message.constant';

@Injectable()
export class VendorService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllVendors(): Promise<Vendor[]> {
    try {
      const vendors = await this.prisma.vendor.findMany({
        where: {
          deletedAt: null,
        },
      });
      return vendors;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getVendorById(vendor_id: string): Promise<Vendor> {
    try {
      const vendor = await this.prisma.vendor.findFirst({
        where: {
          id: vendor_id,
        },
        include: {
          inventory: true,
        },
      });
      return vendor;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createVendor(payload: CreateVendorInput): Promise<VendorResponse> {
    try {
      const vendor = await this.prisma.vendor.create({
        data: payload,
      });
      return {
        message: messages.vendor_created,
        vendor,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updatedVendor(
    vendor_id: string,
    payload: Partial<CreateVendorInput>,
  ): Promise<VendorResponse> {
    try {
      const vendor = await this.prisma.vendor.update({
        where: {
          id: vendor_id,
        },
        data: payload,
      });
      return {
        message: messages.vendor_updated,
        vendor,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
