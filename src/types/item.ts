import { ApiResponse } from "./common";

// item(품목)
//? 4월 23일
export interface Item {
  id: number; // 품목 id
  itemCode: string; // 품목 코드
  itemName: string; // 품목 이름
  itemQuantity: number; // 수량
  warehouseId: number; // 창고 id (FK)
  createdAt: string | null;
  updatedAt: string | null;
  memo: string | null;
}

// 프론트엔드에서 사용할 형식
export interface CreateItemRequest {
  name: string; // itemName과 동일
  description: string;
  sku: string; // itemCode와 동일
  warehouseId: number; // warehouseId와 동일
  quantity: number; // itemQuantity와 동일
  minimumQuantity: number;
  category: string;
  unit: string;
  price: number;
}

// API 요청 시 사용할 형식
export interface CreateItemApiRequest {
  itemName: string;
  itemCode: string;
  itemQuantity: number;
  warehouseId: number;
}

export interface UpdateItemRequest {
  name?: string;
  description?: string;
  sku?: string;
  warehouseId?: string;
  minimumQuantity?: number;
  category?: string;
  unit?: string;
  price?: number;
}

export interface UpdateItemQuantityRequest {
  quantity: number;
}

export interface ItemResponse extends ApiResponse {
  data?: Item;
}

export interface ItemsResponse extends ApiResponse {
  data?: Item[];
}

export interface ItemsByWarehouseResponse extends ApiResponse {
  data?: {
    warehouseId: string;
    items: Item[];
  };
}
