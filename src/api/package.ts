import { api } from "./api";
import { ApiResponse } from "../types/common";
import {
  // Package,
  CreatePackageRequest,
  UpdatePackageRequest,
} from "../types/package";

export const createPackage = async (
  data: CreatePackageRequest
): Promise<ApiResponse> => {
  try {
    const response = await api.post<ApiResponse>("/package", data);
    return response.data;
  } catch {
    return { success: false, message: "패키지 생성에 실패했습니다." };
  }
};

export const getAllPackages = async (): Promise<ApiResponse> => {
  try {
    const response = await api.get<ApiResponse>("/package");
    return response.data;
  } catch {
    return { success: false, message: "패키지 목록 조회에 실패했습니다." };
  }
};

export const getPackage = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await api.get<ApiResponse>(`/package/${id}`);
    return response.data;
  } catch {
    return { success: false, message: "패키지 조회에 실패했습니다." };
  }
};

export const updatePackage = async (
  id: string,
  data: UpdatePackageRequest
): Promise<ApiResponse> => {
  try {
    const response = await api.patch<ApiResponse>(`/package/${id}`, data);
    return response.data;
  } catch {
    return { success: false, message: "패키지 수정에 실패했습니다." };
  }
};

export const deletePackage = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await api.delete<ApiResponse>(`/package/${id}`);
    return response.data;
  } catch {
    return { success: false, message: "패키지 삭제에 실패했습니다." };
  }
};
