/* eslint-disable @typescript-eslint/no-unused-vars */
import { api, ApiResponse } from "./api";
import {
  Warehouse,
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
} from "@/types/warehouse";

export const warehouseApi = {
  // 창고 생성
  createWarehouse: async (
    data: CreateWarehouseRequest
  ): Promise<ApiResponse<Warehouse>> => {
    try {
      const response = await api.post<Warehouse>("/warehouse", data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "창고 생성에 실패했습니다." };
    }
  },

  // 모든 창고 조회 (선택적으로 특정 팀의 창고만 조회)
  getAllWarehouses: async (
    teamId?: string
  ): Promise<ApiResponse<Warehouse[]>> => {
    try {
      const params = teamId ? { teamId } : undefined;
      const response = await api.get<Warehouse[]>("/warehouse", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "창고 목록 조회에 실패했습니다." };
    }
  },

  // 팀별 창고 조회
  getTeamWarehouses: async (
    teamId: string
  ): Promise<ApiResponse<Warehouse[]>> => {
    try {
      const response = await api.get<Warehouse[]>(`/warehouse/team/${teamId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "팀별 창고 목록 조회에 실패했습니다." };
    }
  },

  // 단일 창고 조회
  getWarehouse: async (
    id: string
  ): Promise<ApiResponse<{ data: Warehouse }>> => {
    try {
      const response = await api.get<{ data: Warehouse }>(`/warehouse/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "창고 조회에 실패했습니다." };
    }
  },

  // 창고 정보 수정
  updateWarehouse: async (
    id: string,
    data: UpdateWarehouseRequest
  ): Promise<ApiResponse<Warehouse>> => {
    try {
      const response = await api.patch<Warehouse>(`/warehouse/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "창고 정보 수정에 실패했습니다." };
    }
  },

  // 창고 삭제
  deleteWarehouse: async (id: string): Promise<ApiResponse<Warehouse>> => {
    try {
      const response = await api.delete<Warehouse>(`/warehouse/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "창고 삭제에 실패했습니다." };
    }
  },

  // 창고 접근 권한 확인
  checkWarehouseAccess: async (
    id: string
  ): Promise<ApiResponse<{ hasAccess: boolean }>> => {
    try {
      const response = await api.get<{ hasAccess: boolean }>(
        `/warehouse/${id}/check-access`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "창고 접근 권한 확인에 실패했습니다." };
    }
  },
};
