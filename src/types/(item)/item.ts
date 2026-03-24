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
  // 매입 집계 필드 (v4.0)
  averageCost?: number | null; // 평균 매입원가
  totalInboundQuantity?: number | null; // 총 입고 수량
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
