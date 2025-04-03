import { api } from "./api";
import { ApiResponse } from "../types/common";
import {
  CreateInventoryRecordRequest,
  UpdateInventoryRecordRequest,
} from "../types/inventory-record";

export const createInventoryRecord = async (
  data: CreateInventoryRecordRequest
): Promise<ApiResponse> => {
  try {
    const response = await api.post<ApiResponse>("/inventory-record", data);
    return response.data;
  } catch {
    return { success: false, message: "재고 기록 생성에 실패했습니다." };
  }
};

export const getAllInventoryRecords = async (): Promise<ApiResponse> => {
  try {
    const response = await api.get<ApiResponse>("/inventory-record");
    return response.data;
  } catch {
    return { success: false, message: "재고 기록 목록 조회에 실패했습니다." };
  }
};

export const getInventoryRecord = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await api.get<ApiResponse>(`/inventory-record/${id}`);
    return response.data;
  } catch {
    return { success: false, message: "재고 기록 조회에 실패했습니다." };
  }
};

export const updateInventoryRecord = async (
  id: string,
  data: UpdateInventoryRecordRequest
): Promise<ApiResponse> => {
  try {
    const response = await api.patch<ApiResponse>(
      `/inventory-record/${id}`,
      data
    );
    return response.data;
  } catch {
    return { success: false, message: "재고 기록 수정에 실패했습니다." };
  }
};

export const deleteInventoryRecord = async (
  id: string
): Promise<ApiResponse> => {
  try {
    const response = await api.delete<ApiResponse>(`/inventory-record/${id}`);
    return response.data;
  } catch {
    return { success: false, message: "재고 기록 삭제에 실패했습니다." };
  }
};
