import { Inventory } from '@prisma/client';

export class InventoryResponse {
  message: string;
  filename?: string;
  csv?: any;
  inventory?: Partial<Inventory> | null;
}
