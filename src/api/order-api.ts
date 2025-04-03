import { api } from "./api";
import { ApiResponse } from "../types/common";
import {
  CreateOrderRequest,
  UpdateOrderRequest,
  UpdateOrderStatusRequest,
} from "../types/order";

export const createOrder = async (
  data: CreateOrderRequest
): Promise<ApiResponse> => {
  try {
    const response = await api.post<ApiResponse>("/order", data);
    return response.data;
  } catch {
    return { success: false, message: "주문 생성에 실패했습니다." };
  }
};

export const getAllOrders = async (): Promise<ApiResponse> => {
  try {
    const response = await api.get<ApiResponse>("/order");
    return response.data;
  } catch {
    return { success: false, message: "주문 목록 조회에 실패했습니다." };
  }
};

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

export const getOrdersBySupplierId = async (
  supplierId: string
): Promise<ApiResponse> => {
  try {
    const response = await api.get<ApiResponse>(
      `/order/supplier/${supplierId}`
    );
    return response.data;
  } catch {
    return { success: false, message: "공급업체별 주문 조회에 실패했습니다." };
  }
};

export const getOrder = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await api.get<ApiResponse>(`/order/${id}`);
    return response.data;
  } catch {
    return { success: false, message: "주문 조회에 실패했습니다." };
  }
};

export const updateOrder = async (
  id: string,
  data: UpdateOrderRequest
): Promise<ApiResponse> => {
  try {
    const response = await api.patch<ApiResponse>(`/order/${id}`, data);
    return response.data;
  } catch {
    return { success: false, message: "주문 수정에 실패했습니다." };
  }
};

export const deleteOrder = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await api.delete<ApiResponse>(`/order/${id}`);
    return response.data;
  } catch {
    return { success: false, message: "주문 삭제에 실패했습니다." };
  }
};

export const updateOrderStatus = async (
  id: string,
  data: UpdateOrderStatusRequest
): Promise<ApiResponse> => {
  try {
    const response = await api.patch<ApiResponse>(`/order/${id}/status`, data);
    return response.data;
  } catch {
    return { success: false, message: "주문 상태 변경에 실패했습니다." };
  }
};
