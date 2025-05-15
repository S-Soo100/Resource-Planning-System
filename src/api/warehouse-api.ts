/* eslint-disable @typescript-eslint/no-unused-vars */
import { api, ApiResponse } from "./api";
import {
  Warehouse,
  CreateWarehouseDto,
  UpdateWarehouseRequest,
} from "@/types/warehouse";

export const warehouseApi = {
  // 창고 생성
  createWarehouse: async (
    data: CreateWarehouseDto
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
    teamId?: string | number
  ): Promise<ApiResponse<Warehouse[]>> => {
    try {
      const params = teamId ? { teamId: teamId.toString() } : undefined;
      const response = await api.get<Warehouse[]>("/warehouse", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "창고 목록 조회에 실패했습니다." };
    }
  },

  // 팀별 창고 조회
  getTeamWarehouses: async (
    teamId: string | number
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
    id: string | number
  ): Promise<ApiResponse<{ data: Warehouse }>> => {
    try {
      console.log(`[API 단일 창고 조회 요청] id: ${id}`);

      const response = await api.get<{ data: Warehouse }>(`/warehouse/${id}`);

      console.log("[API 단일 창고 조회 응답]", {
        warehouseName: response.data.data.warehouseName,
        warehouseAddress: response.data.data.warehouseAddress,
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error("[API 단일 창고 조회 오류]", error);
      return { success: false, error: "창고 조회에 실패했습니다." };
    }
  },

  // 창고 정보 수정
  updateWarehouse: async (
    id: string | number,
    data: UpdateWarehouseRequest
  ): Promise<ApiResponse<Warehouse>> => {
    try {
      console.log("[API 창고 수정 요청]", {
        id,
        url: `/warehouse/${id}`,
        data,
      });

      const response = await api.patch<Warehouse>(`/warehouse/${id}`, data);

      console.log("[API 창고 수정 응답]", response.data);

      return { success: true, data: response.data };
    } catch (error) {
      console.error("[API 창고 수정 오류]", error);
      return { success: false, error: "창고 정보 수정에 실패했습니다." };
    }
  },

  // 창고 삭제
  deleteWarehouse: async (
    id: string | number
  ): Promise<ApiResponse<Warehouse>> => {
    try {
      const response = await api.delete<Warehouse>(`/warehouse/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "창고 삭제에 실패했습니다." };
    }
  },

  // 창고 접근 권한 확인
  checkWarehouseAccess: async (
    id: string | number
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
