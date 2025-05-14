import { ApiResponse } from "./common";

export interface IPackage {
  id: number;
  packageName: string;
  teamId: number;
  itemlist: string[];
  createdAt?: string | null;
  updatedAt?: string | null;
  team: {
    id: number;
    teamName: string;
  };
  inventoryRecords: Array<{
    id: number;
    inboundDate: string;
    outboundDate: string;
    inboundQuantity: number;
    outboundQuantity: number;
  }>;
}

export interface PackageApi {
  id: number;
  packageName: string;
  teamId: number;
  itemlist: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  team: {
    id: number;
    teamName: string;
  };
  inventoryRecords: Array<{
    id: number;
    inboundDate: string;
    outboundDate: string;
    inboundQuantity: number;
    outboundQuantity: number;
  }>;
}

export interface CreateIPackageDto {
  packageName: string;
  teamId: number;
  itemlist: string[];
}

export interface CreatePackageDto {
  packageName: string;
  teamId: number;
  itemlist: string;
}

export interface UpdatePackageDto {
  packageName?: string;
  teamId?: number;
  itemlist?: string;
}

export interface PackageResponse extends ApiResponse {
  data?: PackageApi;
}

export interface PackagesResponse extends ApiResponse {
  data?: PackageApi[];
}
