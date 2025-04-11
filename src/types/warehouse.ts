import { Item } from "./item";

// warehouse(창고)
export interface TeamWarehouse {
  id: number; // 창고 id
  warehouseName: string; // 창고 이름
  warehouseAddress: string; // 창고 주소
  location: string; // 창고 위치
  capacity: number; // 창고 용량
  // teamId: number; // 팀 id (FK)
}

export interface Warehouse {
  id: string;
  warehouseName: string;
  description?: string;
  teamId: string;
  team: {
    id: number;
    teamName: string;
  };
  items: Item[];
  warehouseAddress?: string;
  capacity?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWarehouseProps {
  id: string;
  warehouseName: string;
  warehouseAddress: string;
  detailLocation: string;
  capacity: number;
}

export interface CreateWarehouseRequest {
  warehouseName: string;
  warehouseAddress: string;
  teamId: number;
}

export interface UpdateWarehouseRequest {
  warehouseName?: string;
  description?: string;
  warehouseAddress?: string;
  capacity?: number;
}

export interface WarehouseResponse {
  success: boolean;
  data?: { data: Warehouse };
  error?: string;
}

export interface WarehousesResponse {
  success: boolean;
  data?: Warehouse[];
  error?: string;
}

export interface WarehouseAccessResponse {
  success: boolean;
  data?: {
    hasAccess: boolean;
  };
  error?: string;
}
