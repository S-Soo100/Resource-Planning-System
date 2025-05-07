/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiResponse } from "./common";
import { Item } from "./item";

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

// // API 응답 구조에 맞는 인터페이스 정의
// export interface ApiInventoryRecord {
//   id: number;
//   inboundDate: string | null;
//   outboundDate: string | null;
//   inboundLocation: string | null;
//   outboundLocation: string | null;
//   inboundPlace: string | null;
//   inboundAddress: string | null;
//   inboundAddressDetail: string | null;
//   outboundPlace: string | null;
//   outboundAddress: string | null;
//   outboundAddressDetail: string | null;
//   inboundQuantity: number | null;
//   outboundQuantity: number | null;
//   remarks: string | null;
//   supplierId: number | null;
//   packageId: number | null;
//   itemId: number | null;
//   userId: number | null;
//   createdAt: string;
//   updatedAt: string;
//   supplier: null;
//   package: null;
//   item: {
//     id: number;
//     itemCode: string;
//     itemName: string;
//     itemQuantity: number;
//     warehouseId: number;
//     createdAt: string;
//     updatedAt: string;
//   } | null;
//   user: null;
// }

export interface CreateInventoryRecordDto {
  itemId: number;
  inboundQuantity?: number;
  outboundQuantity?: number;
  inboundLocation?: string;
  outboundLocation?: string;
  remarks?: string;
  inboundDate?: string;
  outboundDate?: string;
  attachedFiles?: File[];
  supplierId?: number;
  userId?: number;
  warehouseId?: number;
  orderId?: number;
  packageId?: number;
}

export interface UpdateInventoryRecordRequest {
  quantity?: number;
  reason?: string;
  referenceId?: string;
  referenceType?: string;
}

export interface InventoryRecordResponse extends ApiResponse {
  data?: {
    data: InventoryRecord;
  };
}

export interface InventoryRecordsResponse {
  success: boolean;
  data: InventoryRecord[];
}

export interface InventoryRecordsByInventoryResponse extends ApiResponse {
  data?: {
    inventoryId: string;
    records: InventoryRecord[];
  };
}

// API 응답 형식
export interface ApiInventoryRecordResponse extends ApiResponse {
  data?: InventoryRecord[];
}
