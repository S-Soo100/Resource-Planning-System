// item(품목)

import { ApiResponse } from "../common";
import { Category } from "./category";

export interface Item {
  id: number;
  itemQuantity: number;
  teamItem: {
    id: number;
    itemCode: string;
    itemName: string;
    memo: string | null;
    teamId: number;
    category: Category;
    createdAt: string;
    updatedAt: string;
  };
  warehouse: {
    id: number;
    warehouseName: string;
    warehouseLocation: string;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  inventoryRecords?: {
    id: number;
    inboundDate: string;
    outboundDate: string;
    inboundQuantity: number;
    outboundQuantity: number;
  }[];
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
  itemQuantity: number;
  warehouseId: number;
  teamItemId: number;
}
export interface UpdateItemRequest {
  itemQuantity: number;
  warehouseId: number;
  teamItemId: number;
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
