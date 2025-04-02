import { ApiResponse } from "./common";

export interface InventoryItem {
  id: string;
  packageId: string;
  warehouseId: string;
  quantity: number;
  location: string;
  lastUpdated: string;
}

export interface CreateInventoryItemRequest {
  packageId: string;
  warehouseId: string;
  quantity: number;
  location: string;
}

export interface UpdateInventoryItemRequest {
  quantity?: number;
  location?: string;
}

export interface InventoryItemResponse extends ApiResponse {
  data?: InventoryItem;
}

export interface InventoryItemsResponse extends ApiResponse {
  data?: InventoryItem[];
}

export interface InventoryByWarehouseResponse extends ApiResponse {
  data?: {
    warehouseId: string;
    items: InventoryItem[];
  };
}

export interface InventoryByPackageResponse extends ApiResponse {
  data?: {
    packageId: string;
    items: InventoryItem[];
  };
}
