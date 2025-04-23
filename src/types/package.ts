import { ApiResponse } from "./common";

// package(패키지)
export interface IPackage {
  packageId: number; // 패키지 id
  packageName: string; // 패키지 이름
}

export interface Package {
  id: string;
  name: string;
  teamId: number;
  itemList: string[];
  description: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreatePackageRequest {
  name: string;
  description: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
}

export interface UpdatePackageRequest {
  name?: string;
  description?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

export interface PackageResponse extends ApiResponse {
  data?: Package;
}

export interface PackagesResponse extends ApiResponse {
  data?: Package[];
}
