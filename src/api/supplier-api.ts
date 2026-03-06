import { api, ApiResponse } from "./api";
import {
  Supplier,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  RepurchaseDueSupplier,
} from "@/types/supplier";
import { CustomerDocument, DocumentType } from "@/types/customer-document";

export const supplierApi = {
  // 납품처 생성
  createSupplier: async (
    data: CreateSupplierRequest
  ): Promise<ApiResponse<Supplier>> => {
    try {
      const response = await api.post<Supplier>("/supplier", data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "납품처 생성에 실패했습니다." };
    }
  },

  // 모든 납품처 조회
  getAllSuppliersByTeamId: async (
    teamId: number,
    name?: string
  ): Promise<ApiResponse<Supplier[]>> => {
    try {
      const params = name ? { name } : undefined;
      const response = await api.get<Supplier[]>(`/supplier/team/${teamId}`, {
        params,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "납품처 목록 조회에 실패했습니다." };
    }
  },

  // 단일 납품처 조회
  getSupplier: async (id: string): Promise<ApiResponse<Supplier>> => {
    try {
      const response = await api.get<
        Supplier | { success: boolean; data: Supplier }
      >(`/supplier/${id}`);
      // 백엔드가 { success, data } 래핑할 수 있음
      const rawData = response.data;
      if (
        rawData &&
        typeof rawData === "object" &&
        "success" in rawData &&
        "data" in rawData
      ) {
        return {
          success: true,
          data: (rawData as { success: boolean; data: Supplier }).data,
        };
      }
      return { success: true, data: rawData as Supplier };
    } catch (error) {
      return { success: false, error: "납품처 조회에 실패했습니다." };
    }
  },

  // 납품처 정보 수정
  updateSupplier: async (
    id: string,
    data: UpdateSupplierRequest
  ): Promise<ApiResponse<Supplier>> => {
    try {
      const response = await api.patch<Supplier>(`/supplier/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "납품처 정보 수정에 실패했습니다." };
    }
  },

  // 납품처 삭제
  deleteSupplier: async (id: string): Promise<ApiResponse<Supplier>> => {
    try {
      const response = await api.delete<Supplier>(`/supplier/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "납품처 삭제에 실패했습니다." };
    }
  },

  // === 고객 서류 관리 (v3.1 - E-006) ===

  // 고객 서류 업로드
  uploadDocument: async (
    supplierId: number,
    file: File,
    documentType: DocumentType,
    memo?: string
  ): Promise<ApiResponse<CustomerDocument>> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);
      if (memo) formData.append("memo", memo);

      const response = await api.post<CustomerDocument>(
        `/supplier/${supplierId}/documents/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "서류 업로드에 실패했습니다." };
    }
  },

  // 고객 서류 목록 조회
  getDocuments: async (
    supplierId: number,
    documentType?: DocumentType
  ): Promise<ApiResponse<CustomerDocument[]>> => {
    try {
      const params = documentType ? { documentType } : undefined;
      const response = await api.get<
        CustomerDocument[] | { success: boolean; data: CustomerDocument[] }
      >(`/supplier/${supplierId}/documents`, { params });
      const rawData = response.data;
      // 백엔드 래핑 대응
      if (
        rawData &&
        !Array.isArray(rawData) &&
        typeof rawData === "object" &&
        "data" in rawData
      ) {
        const inner = (rawData as { data: CustomerDocument[] }).data;
        return { success: true, data: Array.isArray(inner) ? inner : [] };
      }
      return { success: true, data: Array.isArray(rawData) ? rawData : [] };
    } catch (error) {
      return { success: false, error: "서류 목록 조회에 실패했습니다." };
    }
  },

  // 고객 서류 삭제
  deleteDocument: async (
    supplierId: number,
    documentId: number
  ): Promise<ApiResponse<void>> => {
    try {
      await api.delete(`/supplier/${supplierId}/documents/${documentId}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: "서류 삭제에 실패했습니다." };
    }
  },

  // 재구매 예정 고객 조회
  getRepurchaseDueSuppliers: async (
    teamId: number
  ): Promise<ApiResponse<RepurchaseDueSupplier[]>> => {
    try {
      const response = await api.get<RepurchaseDueSupplier[]>(
        "/supplier/repurchase-due",
        { params: { teamId } }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "재구매 예정 고객 조회에 실패했습니다." };
    }
  },
};
