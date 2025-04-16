import { ApiResponse } from "./common";

// export interface InventoryRecord {
//   id: number;
//   name: string;
//   quantity: number;
//   price: number;
//   description: string;
//   createdAt: string;
//   updatedAt: string;
//   supplierId: number;
//   supplier: {
//     id: number;
//     name: string;
//     contact: string;
//     email: string;
//   };
// }

// API 응답 구조에 맞는 인터페이스 정의
export interface ApiInventoryRecord {
  id: number;
  inboundDate: string | null;
  outboundDate: string | null;
  inboundLocation: string | null;
  outboundLocation: string | null;
  inboundQuantity: number | null;
  outboundQuantity: number | null;
  remarks: string | null;
  supplierId: number | null;
  packageId: number | null;
  itemId: number | null;
  userId: number | null;
  createdAt: string;
  updatedAt: string;
  supplier: null;
  package: null;
  item: {
    id: number;
    itemCode: string;
    itemName: string;
    itemQuantity: number;
    warehouseId: number;
    createdAt: string;
    updatedAt: string;
  } | null;
  user: null;
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
  quantity?: number | null;
  warehouseId?: number | null;
}

export interface UpdateInventoryRecordRequest {
  quantity?: number;
  reason?: string;
  referenceId?: string;
  referenceType?: string;
}

export interface InventoryRecordResponse extends ApiResponse {
  data?: ApiInventoryRecord;
}

export interface InventoryRecordsResponse extends ApiResponse {
  data?: ApiInventoryRecord[];
}

export interface InventoryRecordsByInventoryResponse extends ApiResponse {
  data?: {
    inventoryId: string;
    records: ApiInventoryRecord[];
  };
}

// API 응답 형식
export interface ApiInventoryRecordResponse extends ApiResponse {
  data?: ApiInventoryRecord[];
}
