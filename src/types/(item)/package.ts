import { ApiResponse } from "../common";

// PackageItem 타입 정의 (백엔드 응답 구조)
export interface PackageItem {
  id: number;
  itemId: number;
  createdAt: string;
  deletedAt: string | null;
  item: {
    id: number;
    itemQuantity: number;
    warehouseId: number;
    teamItemId: number;
    teamItem: {
      id: number;
      itemCode: string;
      itemName: string;
      itemPrice?: number;
      memo?: string | null;
    };
    warehouse: {
      id: number;
      warehouseName: string;
    };
  };
}

export interface IPackage {
  id: number;
  packageName: string;
  teamId: number;
  itemlist: string | null; // deprecated
  packageItems: PackageItem[];
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
  team: {
    id: number;
    teamName: string;
    createdAt?: string | null;
    updatedAt?: string | null;
    deletedAt?: string | null;
  };
  inventoryRecords?: Array<{
    id: number;
    inboundDate: string;
    outboundDate: string | null;
    inboundLocation: string;
    outboundLocation: string | null;
    inboundQuantity: number;
    outboundQuantity: number | null;
    remarks: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  }>;
}

export interface PackageApi {
  id: number;
  packageName: string;
  teamId: number;
  itemlist: string | null; // deprecated
  packageItems: PackageItem[];
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
  team: {
    id: number;
    teamName: string;
    createdAt?: string | null;
    updatedAt?: string | null;
    deletedAt?: string | null;
  };
  inventoryRecords?: Array<{
    id: number;
    inboundDate: string;
    outboundDate: string | null;
    inboundLocation: string;
    outboundLocation: string | null;
    inboundQuantity: number;
    outboundQuantity: number | null;
    remarks: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  }>;
}

// 프론트엔드에서 사용하는 생성 DTO (itemId 배열로 전송)
export interface CreateIPackageDto {
  packageName: string;
  teamId: number;
  itemIds: number[]; // itemCode가 아닌 Item의 PK
}

// 백엔드 API 요청 DTO
export interface CreatePackageDto {
  packageName: string;
  teamId: number;
  itemIds?: number[];
  itemlist?: string; // deprecated
}

export interface UpdatePackageDto {
  packageName?: string;
  teamId?: number;
  itemIds?: number[]; // 제공 시 기존 품목 전체 대체
  itemlist?: string; // deprecated
}

export interface PackageResponse extends ApiResponse {
  data?: PackageApi;
}

export interface PackagesResponse extends ApiResponse {
  data?: PackageApi[];
}
