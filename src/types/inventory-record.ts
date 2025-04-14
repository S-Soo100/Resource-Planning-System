import { ApiResponse } from "./common";

//!
export interface InventoryRecord {
  id: number;
  name: string;
  quantity: number;
  price: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  supplierId: number;
  supplier: {
    id: number;
    name: string;
    contact: string;
    email: string;
  };
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
