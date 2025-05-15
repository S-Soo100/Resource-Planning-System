import { Item } from "../(item)/item";

export interface InventoryRecord {
  id: string;
  item: Item;
  quantity: number;
  inboundDate?: string;
  outboundDate?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}
