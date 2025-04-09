import { api } from "./api";
import { ApiResponse } from "../types/common";
import {
  CreateItemApiRequest,
  UpdateItemRequest,
  UpdateItemQuantityRequest,
} from "../types/item";

export const createItem = async (
  data: CreateItemApiRequest
): Promise<ApiResponse> => {
  try {
    const response = await api.post<ApiResponse>("/item", data);
    return response.data;
  } catch {
    return { success: false, message: "아이템 생성에 실패했습니다." };
  }
};

export const getAllItems = async (
  search?: string,
  warehouseId?: string
): Promise<ApiResponse> => {
  try {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (warehouseId) params.append("warehouseId", warehouseId);

    const response = await api.get<ApiResponse>(`/item?${params.toString()}`);
    return response.data;
  } catch {
    return { success: false, message: "아이템 목록 조회에 실패했습니다." };
  }
};

export const getItemsByWarehouse = async (
  warehouseId: string
): Promise<ApiResponse> => {
  try {
    const response = await api.get<ApiResponse>(
      `/item/warehouse/${warehouseId}`
    );
    return response.data;
  } catch {
    return { success: false, message: "창고별 아이템 조회에 실패했습니다." };
  }
};

export const getItem = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await api.get<ApiResponse>(`/item/${id}`);
    return response.data;
  } catch {
    return { success: false, message: "아이템 조회에 실패했습니다." };
  }
};

export const updateItem = async (
  id: string,
  data: UpdateItemRequest
): Promise<ApiResponse> => {
  try {
    const response = await api.patch<ApiResponse>(`/item/${id}`, data);
    return response.data;
  } catch {
    return { success: false, message: "아이템 수정에 실패했습니다." };
  }
};

export const deleteItem = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await api.delete<ApiResponse>(`/item/${id}`);
    return response.data;
  } catch {
    return { success: false, message: "아이템 삭제에 실패했습니다." };
  }
};

export const updateItemQuantity = async (
  id: string,
  data: UpdateItemQuantityRequest
): Promise<ApiResponse> => {
  try {
    const response = await api.patch<ApiResponse>(`/item/${id}/quantity`, data);
    return response.data;
  } catch {
    return { success: false, message: "아이템 수량 변경에 실패했습니다." };
  }
};
