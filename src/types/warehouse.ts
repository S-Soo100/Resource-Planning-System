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
  sortOrder: number | null; // 정렬 순서 (0부터 시작, null = 순서 미지정)
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreateWarehouseProps {
  id: number;
  warehouseName: string;
  warehouseAddress: string;
  detailLocation: string;
  sortOrder?: number | null; // 정렬 순서 (선택적)
}

export interface CreateWarehouseDto {
  warehouseName: string;
  warehouseAddress: string;
  description?: string;
  teamId: number;
  sortOrder?: number | null; // 정렬 순서 (선택적, 미전송 시 null)
}

export interface UpdateWarehouseRequest {
  warehouseName?: string;
  warehouseAddress?: string;
  description?: string;
  teamId?: number;
  sortOrder?: number | null; // 정렬 순서 (선택적)
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
