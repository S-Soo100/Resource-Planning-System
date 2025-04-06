import { Iitem } from "./item";

// warehouse(창고)
export interface IWarehouse {
  warehouseId: number; // 창고 id
  warehouseName: string; // 창고 이름
  warehouseAddress: string; // 창고 주소
  // teamId: number; // 팀 id (FK)
}

export interface Warehouse {
  id: string;
  name: string;
  description?: string;
  teamId: string;
  team: {
    id: number;
    teamName: string;
  };
  items: Iitem[];
  location?: string;
  capacity?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWarehouseRequest {
  name: string;
  description?: string;
  teamId: string;
  location?: string;
  capacity?: number;
}

export interface UpdateWarehouseRequest {
  name?: string;
  description?: string;
  location?: string;
  capacity?: number;
}

export interface WarehouseResponse {
  success: boolean;
  data?: Warehouse;
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
