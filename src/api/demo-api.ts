import { api } from "./api";
import { ApiResponse } from "../types/common";
import { DemoResponse } from "@/types/demo/demo";
// import { AxiosError } from "axios";

export const getDemoByTeamId = async (
  teamId: number
): Promise<ApiResponse<DemoResponse>> => {
  try {
    const response = await api.get<ApiResponse<DemoResponse>>(
      `/order/demo/team/${teamId}`
    );
    return response.data;
  } catch {
    return { success: false, message: "주문 데모 목록 조회에 실패했습니다." };
  }
};

//? 무조건 teamId로 조회하세요
// export const getDemo = async (): Promise<ApiResponse> => {
//   try {
//     const response = await api.get<ApiResponse>("/order/demo");
//     return response.data;
//   } catch {
//     return { success: false, message: "주문 데모 조회에 실패했습니다." };
//   }
// };

export const createDemo = async (): Promise<ApiResponse> => {
  try {
    const response = await api.post<ApiResponse>("/order/demo");
    return response.data;
  } catch {
    return { success: false, message: "주문 데모 생성에 실패했습니다." };
  }
};

export const getDemoById = async (id: number): Promise<ApiResponse> => {
  try {
    const response = await api.get<ApiResponse>(`/order/demo/${id}`);
    return response.data;
  } catch {
    return { success: false, message: "주문 데모 조회에 실패했습니다." };
  }
};

export const updateDemoStatusById = async (
  id: number,
  data: { status: string }
): Promise<ApiResponse> => {
  try {
    const response = await api.patch<ApiResponse>(
      `/order/demo/${id}/status`,
      data
    );
    return response.data;
  } catch {
    return { success: false, message: "주문 데모 조회에 실패했습니다." };
  }
};
