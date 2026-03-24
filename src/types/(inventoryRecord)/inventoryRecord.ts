import { Item } from "../(item)/item";

export interface InventoryRecord {
  id: string;
  item: Item;
  cost?: number;
  quantity: number;
  inboundDate?: string;
  outboundDate?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}
