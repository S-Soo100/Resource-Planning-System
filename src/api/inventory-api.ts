import { api } from "./api";
import { ApiResponse } from "../types/common";
import {
  CreateInventoryItemRequest,
  UpdateInventoryItemRequest,
} from "../types/inventory";

export const createInventoryItem = async (
  data: CreateInventoryItemRequest
): Promise<ApiResponse> => {
  try {
    const response = await api.post<ApiResponse>("/inventory", data);
    return response.data;
  } catch {
    return { success: false, message: "재고 항목 생성에 실패했습니다." };
  }
};

export const getAllInventoryItems = async (): Promise<ApiResponse> => {
  try {
    const response = await api.get<ApiResponse>("/inventory");
    return response.data;
  } catch {
    return { success: false, message: "재고 목록 조회에 실패했습니다." };
  }
};

export const getInventoryByWarehouse = async (
  warehouseId: string
): Promise<ApiResponse> => {
  try {
    const response = await api.get<ApiResponse>(
      `/inventory/warehouse/${warehouseId}`
    );
    return response.data;
  } catch {
    return { success: false, message: "창고별 재고 조회에 실패했습니다." };
  }
};

export const getInventoryByPackage = async (
  packageId: string
): Promise<ApiResponse> => {
  try {
    const response = await api.get<ApiResponse>(
      `/inventory/package/${packageId}`
    );
    return response.data;
  } catch {
    return { success: false, message: "패키지별 재고 조회에 실패했습니다." };
  }
};

export const getInventoryItem = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await api.get<ApiResponse>(`/inventory/${id}`);
    return response.data;
  } catch {
    return { success: false, message: "재고 항목 조회에 실패했습니다." };
  }
};

export const updateInventoryItem = async (
  id: string,
  data: UpdateInventoryItemRequest
): Promise<ApiResponse> => {
  try {
    const response = await api.patch<ApiResponse>(`/inventory/${id}`, data);
    return response.data;
  } catch {
    return { success: false, message: "재고 항목 수정에 실패했습니다." };
  }
};

export const deleteInventoryItem = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await api.delete<ApiResponse>(`/inventory/${id}`);
    return response.data;
  } catch {
    return { success: false, message: "재고 항목 삭제에 실패했습니다." };
  }
};
