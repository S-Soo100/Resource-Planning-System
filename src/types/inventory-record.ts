import { ApiResponse } from "./common";

export enum InventoryRecordType {
  IN = "IN",
  OUT = "OUT",
  ADJUSTMENT = "ADJUSTMENT",
}

export interface InventoryRecord {
  id: string;
  inventoryId: string;
  type: InventoryRecordType;
  quantity: number;
  reason: string;
  referenceId?: string;
  referenceType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryRecordRequest {
  inboundDate?: string;
  outboundDate?: string;
  inboundLocation?: string;
  outboundLocation?: string;
  inboundQuantity?: number;
  outboundQuantity?: number;
  remarks?: string;
  supplierId?: number;
  packageId?: number;
  itemId?: number;
  userId?: number;
  name?: string;
  price?: number;
  description?: string;
}

export interface UpdateInventoryRecordRequest {
  type?: InventoryRecordType;
  quantity?: number;
  reason?: string;
  referenceId?: string;
  referenceType?: string;
}

export interface InventoryRecordResponse extends ApiResponse {
  data?: InventoryRecord;
}

export interface InventoryRecordsResponse extends ApiResponse {
  data?: InventoryRecord[];
}

export interface InventoryRecordsByInventoryResponse extends ApiResponse {
  data?: {
    inventoryId: string;
    records: InventoryRecord[];
  };
}
