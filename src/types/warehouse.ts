import { Item } from "./(item)/item";

// warehouse(창고)
export interface TeamWarehouse {
  id: number; // 창고 id
  warehouseName: string; // 창고 이름
  warehouseAddress: string; // 창고 주소
  // teamId: number; // 팀 id (FK)
}

export interface Warehouse {
  id: number;
  warehouseName: string;
  description?: string;
  teamId: number;
  team: {
    id: number;
    teamName: string;
  };
  items: Item[];
  warehouseAddress?: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreateWarehouseProps {
  id: number;
  warehouseName: string;
  warehouseAddress: string;
  detailLocation: string;
}

export interface CreateWarehouseDto {
  warehouseName: string;
  warehouseAddress: string;
  description?: string;
  teamId: number;
}

export interface UpdateWarehouseRequest {
  warehouseName?: string;
  warehouseAddress?: string;
  description?: string;
  teamId?: number;
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
