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
  inboundDate?: string | null;
  outboundDate?: string | null;
  inboundLocation?: string | null;
  outboundLocation?: string | null;
  inboundQuantity?: number | null;
  outboundQuantity?: number | null;
  remarks?: string | null;
  supplierId?: number | null;
  packageId?: number | null;
  itemId?: number | null;
  userId?: number | null;
  name?: string | null;
  price?: number | null;
  description?: string | null;
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
