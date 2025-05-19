import { api } from "./api";
import { ApiResponse } from "../types/common";
import {
  CreateItemApiRequest,
  UpdateItemRequest,
  UpdateItemQuantityRequest,
} from "../types/(item)/item";
import { authStore } from "@/store/authStore";
import { TeamWarehouse } from "@/types/warehouse";

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

export const getAllItemsByTeamId = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  teamId: string
): Promise<ApiResponse> => {
  try {
    const selectedTeam = authStore.getState().selectedTeam;
    if (!selectedTeam || !selectedTeam.warehouses) {
      return { success: false, message: "팀 정보를 찾을 수 없습니다." };
    }

    // 모든 창고의 아이템을 병렬로 조회
    const warehousePromises = selectedTeam.warehouses.map(
      (warehouse: TeamWarehouse) => getItemsByWarehouse(warehouse.id)
    );
    const warehouseResponses = await Promise.all(warehousePromises);

    // 모든 창고의 아이템을 하나의 배열로 합치기
    const allItems = warehouseResponses
      .filter((response: ApiResponse) => response.success && response.data)
      .flatMap((response: ApiResponse) => response.data);

    return { success: true, data: allItems };
  } catch {
    return { success: false, message: "아이템 목록 조회에 실패했습니다." };
  }
};

export const getItemsByWarehouse = async (
  warehouseId: string | number
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
