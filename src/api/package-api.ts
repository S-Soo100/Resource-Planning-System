import { api } from "./api";
import { ApiResponse } from "../types/common";
import {
  // Package,
  CreatePackageDto,
  CreateIPackageDto,
  UpdatePackageDto,
  PackageResponse,
  PackagesResponse,
} from "../types/(item)/package";

const createPackage = async (
  data: CreateIPackageDto
): Promise<PackageResponse> => {
  // CreateIPackageDto를 CreatePackageDto로 변환
  const packageData: CreatePackageDto = {
    packageName: data.packageName,
    teamId: data.teamId,
    itemlist: data.itemlist.join(", "), // 배열을 쉼표로 구분된 문자열로 변환
  };

  try {
    const response = await api.post<PackageResponse>("/package", packageData);
    return response.data;
  } catch {
    return { success: false, message: "패키지 생성에 실패했습니다." };
  }
};

// const getAllPackages = async (): Promise<ApiResponse> => {
//   try {
//     const response = await api.get<ApiResponse>("/package");
//     return response.data;
//   } catch {
//     return { success: false, message: "패키지 목록 조회에 실패했습니다." };
//   }
// };

const getTeamPackages = async (teamId: string): Promise<PackagesResponse> => {
  try {
    const response = await api.get<PackagesResponse>(`/package/team/${teamId}`);
    return response.data;
  } catch {
    return { success: false, message: "패키지 조회에 실패했습니다." };
  }
};

const updatePackage = async (
  id: string,
  data: UpdatePackageDto
): Promise<ApiResponse> => {
  try {
    const response = await api.patch<ApiResponse>(`/package/${id}`, data);
    return response.data;
  } catch {
    return { success: false, message: "패키지 수정에 실패했습니다." };
  }
};

const deletePackage = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await api.delete<ApiResponse>(`/package/${id}`);
    return response.data;
  } catch {
    return { success: false, message: "패키지 삭제에 실패했습니다." };
  }
};

export const packageApi = {
  createPackage,
  // getAllPackages,
  getPackage: getTeamPackages,
  updatePackage,
  deletePackage,
};
