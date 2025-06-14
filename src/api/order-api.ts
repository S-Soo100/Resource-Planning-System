import { api } from "./api";
import { ApiResponse } from "../types/common";
import {
  CreateOrderDto,
  CreatOrderResponse,
  UpdateOrderDto,
  UpdateOrderStatusDto,
  OrderFile as OrderFileResponse,
} from "../types/(order)/order";
import { AxiosError } from "axios";

// 주문 생성
export const createOrder = async (
  data: CreateOrderDto
): Promise<ApiResponse<CreatOrderResponse>> => {
  try {
    const response = await api.post<ApiResponse>("/order", data);
    return response.data as ApiResponse<CreatOrderResponse>;
  } catch {
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
  } catch {
    return { success: false, message: "주문 상태 변경에 실패했습니다." };
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
    formData.append("file", file);
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
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("expirationTimeMinutes", expirationTimeMinutes.toString());

    const response = await api.post<ApiResponse<OrderFileResponse[]>>(
      `/order/${id}/upload-multiple-with-signed-url`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data as ApiResponse<OrderFileResponse[]>;
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
