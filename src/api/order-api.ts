import { api } from "./api";
import { ApiResponse } from "../types/common";
import { normalizeFileName } from "@/utils/fileUtils";
import {
  CreateOrderDto,
  CreatOrderResponse,
  UpdateOrderDto,
  UpdateOrderStatusDto,
  OrderFile as OrderFileResponse,
} from "../types/(order)/order";
import { AxiosError } from "axios";
import {
  CreateOrderCommentDto,
  UpdateOrderCommentDto,
} from "@/types/(order)/orderComment";

// 주문 생성
export const createOrder = async (
  data: CreateOrderDto
): Promise<ApiResponse<CreatOrderResponse>> => {
  try {
    // 개별품목발주는 복잡한 작업이므로 더 긴 타임아웃 설정 (30초)
    const response = await api.post<ApiResponse>("/order", data, {
      timeout: 30000,
    });
    return response.data as ApiResponse<CreatOrderResponse>;
  } catch (error: unknown) {
    console.error("[API] 주문 생성 오류:", error);

    // AxiosError 타입 체크
    if (error instanceof AxiosError) {
      // 타임아웃 오류 처리
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        return {
          success: false,
          message: "요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.",
        };
      }

      // 네트워크 오류 처리
      if (error.code === "ERR_NETWORK") {
        return {
          success: false,
          message: "네트워크 연결을 확인해주세요.",
        };
      }

      // 서버 응답이 있는 경우
      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message,
        };
      }
    }

    return { success: false, message: "주문 생성에 실패했습니다." };
  }
};

// 모든 주문 조회
export const getOrdersByTeamId = async (
  teamId: number
): Promise<ApiResponse> => {
  try {
    const response = await api.get<ApiResponse>(`/order/team/${teamId}`);
    return response.data;
  } catch {
    return { success: false, message: "주문 목록 조회에 실패했습니다." };
  }
};

// 사용자별 주문 조회
export const getOrdersByUserId = async (
  userId: string
): Promise<ApiResponse> => {
  try {
    const response = await api.get<ApiResponse>(`/order/user/${userId}`);
    return response.data;
  } catch {
    return { success: false, message: "사용자별 주문 조회에 실패했습니다." };
  }
};

// 거래처별 주문 조회
export const getOrdersBySupplierId = async (
  supplierId: string
): Promise<ApiResponse> => {
  try {
    const response = await api.get<ApiResponse>(
      `/order/supplier/${supplierId}`
    );
    return response.data;
  } catch {
    return { success: false, message: "거래처별 주문 조회에 실패했습니다." };
  }
};

// 단일 주문 조회
export const getOrder = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await api.get<ApiResponse>(`/order/${id}`);
    return response.data;
  } catch {
    return { success: false, message: "주문 조회에 실패했습니다." };
  }
};

// 주문 정보 수정
export const updateOrder = async (
  id: string,
  data: UpdateOrderDto
): Promise<ApiResponse> => {
  try {
    const response = await api.patch<ApiResponse>(`/order/${id}`, data);
    return response.data;
  } catch {
    return { success: false, message: "주문 수정에 실패했습니다." };
  }
};

// 주문 삭제
export const deleteOrder = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await api.delete<ApiResponse>(`/order/${id}`);
    return response.data;
  } catch {
    return { success: false, message: "주문 삭제에 실패했습니다." };
  }
};

// 주문 상태 변경
export const updateOrderStatus = async (
  id: string,
  data: UpdateOrderStatusDto
): Promise<ApiResponse> => {
  try {
    const response = await api.patch<ApiResponse>(`/order/${id}/status`, data);
    return response.data;
  } catch (error: unknown) {
    console.error("[API] 주문 상태 변경 오류:", error);

    // AxiosError 타입 체크
    if (error instanceof AxiosError) {
      // 서버 응답이 있는 경우 서버 에러 메시지 사용
      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message,
        };
      }

      // 네트워크 오류 처리
      if (error.code === "ERR_NETWORK") {
        return {
          success: false,
          message: "네트워크 연결을 확인해주세요.",
        };
      }

      // 타임아웃 오류 처리
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        return {
          success: false,
          message: "요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.",
        };
      }
    }

    return { 
      success: false, 
      message: "주문 상태 변경에 실패했습니다." 
    };
  }
};

// 파일 업로드 API
export const uploadOrderFileById = async (
  id: number,
  file: File,
  expirationTimeMinutes: number = 30
): Promise<ApiResponse<OrderFileResponse>> => {
  try {
    const formData = new FormData();
    // 파일명 정규화하여 새로운 File 객체 생성
    const normalizedFileName = normalizeFileName(file);
    const normalizedFile = new File([file], normalizedFileName, {
      type: file.type,
      lastModified: file.lastModified,
    });
    formData.append("file", normalizedFile);
    formData.append("expirationTimeMinutes", expirationTimeMinutes.toString());

    const response = await api.post<ApiResponse<OrderFileResponse>>(
      `/order/${id}/upload-with-signed-url`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data as ApiResponse<OrderFileResponse>;
  } catch (error) {
    console.error("파일 업로드 실패:", error);
    if (error instanceof AxiosError && error.response) {
      return {
        success: false,
        error: error.response.data.message || "파일 업로드에 실패했습니다.",
        data: undefined,
      };
    }
    return {
      success: false,
      error: "파일 업로드에 실패했습니다.",
      data: undefined,
    };
  }
};

// 파일 업로드 API
export const uploadMultipleOrderFileById = async (
  id: number,
  files: File[],
  expirationTimeMinutes: number = 30
): Promise<ApiResponse<OrderFileResponse[]>> => {
  try {
    console.log("[파일 업로드 API] 업로드 시작:", {
      orderId: id,
      fileCount: files.length,
      fileNames: files.map((f) => f.name),
    });

    const formData = new FormData();
    files.forEach((file, index) => {
      // 파일명 정규화하여 새로운 File 객체 생성
      const originalName = file.name;
      const normalizedFileName = normalizeFileName(file);
      const normalizedFile = new File([file], normalizedFileName, {
        type: file.type,
        lastModified: file.lastModified,
      });

      console.log(`[파일 업로드 API] 파일 ${index + 1} 처리:`, {
        original: originalName,
        normalized: normalizedFileName,
        isChanged: originalName !== normalizedFileName,
      });

      formData.append("files", normalizedFile);
    });
    formData.append("expirationTimeMinutes", expirationTimeMinutes.toString());

    console.log("[파일 업로드 API] 서버 전송:", {
      orderId: id,
      normalizedFileNames: files.map((f) => normalizeFileName(f)),
    });

    const response = await api.post<ApiResponse<OrderFileResponse[]>>(
      `/order/${id}/upload-multiple-with-signed-url`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("[파일 업로드 API] 서버 응답:", {
      success: response.data.success,
      fileCount: response.data.data?.length,
      fileNames: response.data.data?.map((f) => f.fileName),
    });

    return response.data as ApiResponse<OrderFileResponse[]>;
  } catch (error) {
    console.error("[파일 업로드 API] 오류:", error);
    if (error instanceof AxiosError && error.response) {
      return {
        success: false,
        error: error.response.data.message || "파일 업로드에 실패했습니다.",
        data: undefined,
      };
    }
    return {
      success: false,
      error: "파일 업로드에 실패했습니다.",
      data: undefined,
    };
  }
};

// 파일 삭제 API
export const deleteOrderFile = async (
  orderId: number,
  fileId: number
): Promise<ApiResponse> => {
  try {
    const response = await api.delete<ApiResponse>(
      `/order/${orderId}/files/${fileId}`
    );
    return response.data;
  } catch (error) {
    console.error("파일 삭제 실패:", error);
    if (error instanceof AxiosError && error.response) {
      return {
        success: false,
        error: error.response.data.message || "파일 삭제에 실패했습니다.",
      };
    }
    return {
      success: false,
      error: "파일 삭제에 실패했습니다.",
    };
  }
};

// # 댓글 생성, orderId에 있는 댓글 생성
export const createOrderComment = async (
  orderId: number,
  data: CreateOrderCommentDto
): Promise<ApiResponse> => {
  try {
    const response = await api.post<ApiResponse>(
      `/order/${orderId}/comments`,
      data
    );
    return response.data;
  } catch {
    return { success: false, message: "댓글 생성에 실패했습니다." };
  }
};

// # 댓글 조회, orderId에 있는 댓글 모두 조회
export const getOrderComments = async (
  orderId: number
): Promise<ApiResponse> => {
  try {
    const response = await api.get<ApiResponse>(`/order/${orderId}/comments`);
    return response.data;
  } catch {
    return { success: false, message: "댓글 조회에 실패했습니다." };
  }
};

// # 댓글 수정, 내가 작성한 댓글 1개만 단일 수정 가능
export const updateOrderComment = async (
  commentId: number,
  data: UpdateOrderCommentDto
): Promise<ApiResponse> => {
  try {
    const response = await api.patch<ApiResponse>(
      `/order/comments/${commentId}`,
      data
    );
    return response.data;
  } catch {
    return { success: false, message: "댓글 수정에 실패했습니다." };
  }
};

// # 댓글 삭제, 내가 작성한 댓글 1개만 단일 삭제 가능
export const deleteOrderComment = async (
  orderId: number,
  commentId: number
): Promise<ApiResponse> => {
  try {
    const response = await api.delete<ApiResponse>(
      `/order/comments/${commentId}`
    );
    return response.data;
  } catch {
    return { success: false, message: "댓글 삭제에 실패했습니다." };
  }
};
