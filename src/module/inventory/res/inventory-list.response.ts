import { Inventory } from '@prisma/client';

export class InventoryListResponse {
  count: number;
  inventories: Partial<Inventory>[];
}
