/* eslint-disable @typescript-eslint/no-unused-vars */
import { api, ApiResponse } from "./api";
import {
  IUser,
  CreateUserDto,
  CreateUserResponse,
  UpdateUserRequest,
  WarehouseAccessRequest,
} from "@/types/(auth)/user";

export const userApi = {
  // 사용자 생성
  createUser: async (
    data: CreateUserDto
  ): Promise<ApiResponse<CreateUserResponse>> => {
    try {
      const response = await api.post<CreateUserResponse>("/user", data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "사용자 생성에 실패했습니다." };
    }
  },

  // 모든 사용자 조회
  getAllUsers: async (): Promise<ApiResponse<IUser[]>> => {
    try {
      const response = await api.get<IUser[]>("/user");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "사용자 목록 조회에 실패했습니다." };
    }
  },

  // 단일 사용자 조회
  getUser: async (id: string): Promise<ApiResponse<IUser>> => {
    try {
      const response = await api.get<{ success: boolean; data: IUser }>(
        `/user/${id}`
      );
      console.log("단일 사용자 조회", response);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: "사용자 조회에 실패했습니다." };
    }
  },

  // 사용자 정보 수정
  updateUser: async (
    id: string,
    data: UpdateUserRequest
  ): Promise<ApiResponse<IUser>> => {
    try {
      const response = await api.patch<IUser>(`/user/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "사용자 정보 수정에 실패했습니다." };
    }
  },

  // 사용자 삭제
  deleteUser: async (id: string): Promise<ApiResponse<IUser>> => {
    try {
      const response = await api.delete<IUser>(`/user/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "사용자 삭제에 실패했습니다." };
    }
  },

  // 사용자 창고 접근 권한 설정
  setWarehouseAccess: async (
    id: string,
    data: WarehouseAccessRequest
  ): Promise<ApiResponse<IUser>> => {
    try {
      const response = await api.patch<IUser>(
        `/user/${id}/warehouse-access`,
        data
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "창고 접근 권한 설정에 실패했습니다." };
    }
  },

  // 현재 사용자의 관리자 여부 확인
  checkAdmin: async (): Promise<ApiResponse<{ isAdmin: boolean }>> => {
    try {
      const response = await api.get<{ isAdmin: boolean }>("/user/check-admin");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "관리자 여부 확인에 실패했습니다." };
    }
  },

  // 특정 창고에 대한 접근 권한 확인
  checkWarehouseAccess: async (
    warehouseId: string
  ): Promise<ApiResponse<{ hasAccess: boolean }>> => {
    try {
      const response = await api.get<{ hasAccess: boolean }>(
        `/user/check-warehouse-access/${warehouseId}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "창고 접근 권한 확인에 실패했습니다." };
    }
  },
};
