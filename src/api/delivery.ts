import { api } from "./api";
import { ApiResponse } from "../types/common";
import {
  CreateDeliveryRequest,
  UpdateDeliveryRequest,
} from "../types/delivery";

export const createDelivery = async (
  data: CreateDeliveryRequest
): Promise<ApiResponse> => {
  try {
    const response = await api.post<ApiResponse>("/delivery", data);
    return response.data;
  } catch {
    return { success: false, message: "배송 생성에 실패했습니다." };
  }
};

export const getAllDeliveries = async (): Promise<ApiResponse> => {
  try {
    const response = await api.get<ApiResponse>("/delivery");
    return response.data;
  } catch {
    return { success: false, message: "배송 목록 조회에 실패했습니다." };
  }
};

export const getDeliveriesByOrder = async (
  orderId: string
): Promise<ApiResponse> => {
  try {
    const response = await api.get<ApiResponse>(`/delivery/order/${orderId}`);
    return response.data;
  } catch {
    return { success: false, message: "주문별 배송 조회에 실패했습니다." };
  }
};

export const getDelivery = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await api.get<ApiResponse>(`/delivery/${id}`);
    return response.data;
  } catch {
    return { success: false, message: "배송 조회에 실패했습니다." };
  }
};

export const updateDelivery = async (
  id: string,
  data: UpdateDeliveryRequest
): Promise<ApiResponse> => {
  try {
    const response = await api.patch<ApiResponse>(`/delivery/${id}`, data);
    return response.data;
  } catch {
    return { success: false, message: "배송 수정에 실패했습니다." };
  }
};

export const deleteDelivery = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await api.delete<ApiResponse>(`/delivery/${id}`);
    return response.data;
  } catch {
    return { success: false, message: "배송 삭제에 실패했습니다." };
  }
};
