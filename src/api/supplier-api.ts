/* eslint-disable @typescript-eslint/no-unused-vars */
import { api, ApiResponse } from "./api";
import {
  Supplier,
  CreateSupplierRequest,
  UpdateSupplierRequest,
} from "@/types/(order)/supplier";

export const supplierApi = {
  // 공급업체 생성
  createSupplier: async (
    data: CreateSupplierRequest
  ): Promise<ApiResponse<Supplier>> => {
    try {
      const response = await api.post<Supplier>("/supplier", data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "공급업체 생성에 실패했습니다." };
    }
  },

  // 모든 공급업체 조회
  getAllSuppliers: async (name?: string): Promise<ApiResponse<Supplier[]>> => {
    try {
      const params = name ? { name } : undefined;
      const response = await api.get<Supplier[]>("/supplier", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "공급업체 목록 조회에 실패했습니다." };
    }
  },

  // 단일 공급업체 조회
  getSupplier: async (id: string): Promise<ApiResponse<Supplier>> => {
    try {
      const response = await api.get<Supplier>(`/supplier/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "공급업체 조회에 실패했습니다." };
    }
  },

  // 공급업체 정보 수정
  updateSupplier: async (
    id: string,
    data: UpdateSupplierRequest
  ): Promise<ApiResponse<Supplier>> => {
    try {
      const response = await api.patch<Supplier>(`/supplier/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "공급업체 정보 수정에 실패했습니다." };
    }
  },

  // 공급업체 삭제
  deleteSupplier: async (id: string): Promise<ApiResponse<Supplier>> => {
    try {
      const response = await api.delete<Supplier>(`/supplier/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "공급업체 삭제에 실패했습니다." };
    }
  },
};
