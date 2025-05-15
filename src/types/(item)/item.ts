// item(품목)

import { ApiResponse } from "../common";
import { TeamItem } from "./team-item";

export interface Item {
  id: number;
  itemQuantity: number;
  itemCode: string;
  itemName: string;
  teamItem: TeamItem;
  warehouseId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  // warehouse: {
  //   id: number;
  //   warehouseName: string;
  //   warehouseLocation: string;
  // };
  // inventoryRecords?: {
  //   id: number;
  //   inboundDate: string;
  //   outboundDate: string;
  //   inboundQuantity: number;
  //   outboundQuantity: number;
  // }[];
}

// API 요청 시 사용할 형식
export interface CreateItemApiRequest {
  itemName: string; // 이전의 name
  itemCode: string; // 이전의 sku
  itemQuantity: number; // 이전의 quantity
  warehouseId: number;
  description?: string;
  minimumQuantity?: number;
  category?: string;
  unit?: string;
  price?: number;
  teamItemId?: number;
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
