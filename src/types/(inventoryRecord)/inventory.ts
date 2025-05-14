/* eslint-disable @typescript-eslint/no-explicit-any */
import { Item } from "../item";

export interface InventoryRecord {
  id: number;
  inboundDate: string | null;
  outboundDate: string | null;
  outboundLocation: string | null;
  inboundLocation: string | null;
  inboundQuantity: number | null;
  outboundQuantity: number | null;
  remarks: string | null;
  packageId: number | null;
  itemId: number;
  userId: number | null;
  orderId: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  supplierId: number | null;
  supplier: any | null;
  package: any | null;
  item: Item;
  user: any | null;
  order: any | null;
  files: any[];
}
