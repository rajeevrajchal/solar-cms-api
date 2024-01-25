import { Inventory } from '@prisma/client';

export class InventoryResponse {
  message: string;
  inventory?: Partial<Inventory> | null;
}
