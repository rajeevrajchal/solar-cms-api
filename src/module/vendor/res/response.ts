import { Vendor } from '@prisma/client';

export class VendorResponse {
  message: string;
  vendor?: Partial<Vendor> | null;
}
