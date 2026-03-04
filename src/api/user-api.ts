import { api, ApiResponse } from "./api";
import {
  IUser,
  CreateUserDto,
  CreateUserResponse,
  UpdateUserRequest,
  WarehouseAccessRequest,
} from "@/types/(auth)/user";
import {
  CustomerDocument,
  DocumentType,
  RepurchaseDueUser,
} from "@/types/customer-document";
import { normalizeFileName } from "@/utils/fileUtils";

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
      // console.log("단일 사용자 조회", response);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: "사용자 조회에 실패했습니다." };
    }
  },

  // 사용자 정보 수정 (이메일, 비밀번호, 이름, 창고 접근 권한, 권한 레벨, 관리자 여부)
  updateUser: async (
    id: string,
    data: UpdateUserRequest
  ): Promise<ApiResponse<IUser>> => {
    try {
      console.log("[user-api] updateUser 요청:", { id, data });
      const response = await api.patch<IUser>(`/user/${id}`, data);
      console.log("[user-api] updateUser 응답:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("[user-api] updateUser 오류:", error);
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

  // === 재구매 예정 고객 API (v2.5) ===

  // 재구매 예정 고객 조회
  getRepurchaseDueUsers: async (
    teamId: number
  ): Promise<ApiResponse<RepurchaseDueUser[]>> => {
    try {
      const response = await api.get<ApiResponse<RepurchaseDueUser[]>>(
        `/user/repurchase-due?teamId=${teamId}`
      );
      return response.data;
    } catch (error) {
      return { success: false, error: "재구매 예정 고객 조회에 실패했습니다." };
    }
  },

  // === 고객 서류 관리 API (v2.5) ===

  // 고객 서류 업로드
  uploadDocument: async (
    userId: number,
    file: File,
    documentType: DocumentType,
    memo?: string,
    orderId?: number
  ): Promise<ApiResponse<CustomerDocument>> => {
    try {
      const formData = new FormData();
      const normalizedFileName = normalizeFileName(file);
      const normalizedFile = new File([file], normalizedFileName, {
        type: file.type,
        lastModified: file.lastModified,
      });
      formData.append("file", normalizedFile);
      formData.append("documentType", documentType);
      if (memo) {
        formData.append("memo", memo);
      }
      if (orderId) {
        formData.append("orderId", orderId.toString());
      }

      const response = await api.post<ApiResponse<CustomerDocument>>(
        `/user/${userId}/documents/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (error) {
      return { success: false, error: "고객 서류 업로드에 실패했습니다." };
    }
  },

  // 고객 서류 목록 조회
  getDocuments: async (
    userId: number,
    documentType?: DocumentType
  ): Promise<ApiResponse<CustomerDocument[]>> => {
    try {
      const params = documentType ? `?documentType=${documentType}` : "";
      const response = await api.get<ApiResponse<CustomerDocument[]>>(
        `/user/${userId}/documents${params}`
      );
      return response.data;
    } catch (error) {
      return { success: false, error: "고객 서류 조회에 실패했습니다." };
    }
  },

  // 고객 서류 삭제
  deleteDocument: async (
    userId: number,
    docId: number
  ): Promise<ApiResponse<CustomerDocument>> => {
    try {
      const response = await api.delete<ApiResponse<CustomerDocument>>(
        `/user/${userId}/documents/${docId}`
      );
      return response.data;
    } catch (error) {
      return { success: false, error: "고객 서류 삭제에 실패했습니다." };
    }
  },
};
