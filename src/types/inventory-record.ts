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
  inventoryId: string;
  type: InventoryRecordType;
  quantity: number;
  reason: string;
  referenceId?: string;
  referenceType?: string;
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
