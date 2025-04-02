import { api } from "./api";
import { ApiResponse } from "../types/common";
import { CreatePaymentRequest, UpdatePaymentRequest } from "../types/payment";

export const createPayment = async (
  data: CreatePaymentRequest
): Promise<ApiResponse> => {
  try {
    const response = await api.post<ApiResponse>("/payment", data);
    return response.data;
  } catch {
    return { success: false, message: "결제 생성에 실패했습니다." };
  }
};

export const getAllPayments = async (): Promise<ApiResponse> => {
  try {
    const response = await api.get<ApiResponse>("/payment");
    return response.data;
  } catch {
    return { success: false, message: "결제 목록 조회에 실패했습니다." };
  }
};

export const getPaymentsByOrder = async (
  orderId: string
): Promise<ApiResponse> => {
  try {
    const response = await api.get<ApiResponse>(`/payment/order/${orderId}`);
    return response.data;
  } catch {
    return { success: false, message: "주문별 결제 조회에 실패했습니다." };
  }
};

export const getPayment = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await api.get<ApiResponse>(`/payment/${id}`);
    return response.data;
  } catch {
    return { success: false, message: "결제 조회에 실패했습니다." };
  }
};

export const updatePayment = async (
  id: string,
  data: UpdatePaymentRequest
): Promise<ApiResponse> => {
  try {
    const response = await api.patch<ApiResponse>(`/payment/${id}`, data);
    return response.data;
  } catch {
    return { success: false, message: "결제 수정에 실패했습니다." };
  }
};

export const deletePayment = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await api.delete<ApiResponse>(`/payment/${id}`);
    return response.data;
  } catch {
    return { success: false, message: "결제 삭제에 실패했습니다." };
  }
};
