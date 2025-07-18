import { api } from "./api";
import { ApiResponse } from "../types/common";
import {
  DemoArrayResponse,
  DemoDetailResponse,
  CreateDemoRequest,
} from "@/types/demo/demo";
// import { AxiosError } from "axios";

export const createDemo = async (
  demoData: CreateDemoRequest
): Promise<ApiResponse> => {
  try {
    const response = await api.post<ApiResponse>("/demo", demoData);
    return response.data;
  } catch {
    return { success: false, message: "시연 생성에 실패했습니다." };
  }
};

export const getDemoByTeamId = async (
  teamId: number
): Promise<ApiResponse<DemoArrayResponse>> => {
  try {
    const response = await api.get<ApiResponse<DemoArrayResponse>>(
      `/demo/team/${teamId}`
    );
    return response.data;
  } catch {
    return { success: false, message: "주문 데모 목록 조회에 실패했습니다." };
  }
};

// export const getDemoById = async (
//   demoId: number
// ): Promise<ApiResponse<DemoDetailResponse>> => {
//   try {
//     const response = await api.get<ApiResponse<DemoDetailResponse>>(
//       `/demo/${demoId}`
//     );
//     return response.data;
//   } catch {
//     return { success: false, message: "시연 상세 조회에 실패했습니다." };
//   }
// };

export const getDemoDetailById = async (
  teamId: number
): Promise<ApiResponse<DemoDetailResponse>> => {
  try {
    const response = await api.get<ApiResponse<DemoDetailResponse>>(
      `/demo/team/${teamId}`
    );
    return response.data;
  } catch {
    return { success: false, message: "주문 데모 목록 조회에 실패했습니다." };
  }
};

export const updateDemoById = async (
  teamId: number,
  update: DemoDetailResponse
): Promise<ApiResponse<DemoDetailResponse>> => {
  try {
    const response = await api.put<ApiResponse<DemoDetailResponse>>(
      `/demo/team/${teamId}`,
      update
    );
    return response.data;
  } catch {
    return { success: false, message: "주문 데모 목록 조회에 실패했습니다." };
  }
};

export const updateDemoStatusById = async (
  id: number,
  data: { status: string }
): Promise<ApiResponse> => {
  try {
    const response = await api.patch<ApiResponse>(`/demo/${id}/status`, data);
    return response.data;
  } catch {
    return { success: false, message: "주문 데모 조회에 실패했습니다." };
  }
};

// 시연 승인/거절
// export const approveDemoById = async (
//   id: number,
//   data: { status: string }
// ): Promise<ApiResponse> => {
//   try {
//     const response = await api.patch<ApiResponse>(`/demo/${id}/approve`, data);
//     return response.data;
//   } catch {
//     return { success: false, message: "주문 데모 조회에 실패했습니다." };
//   }
// };

export const creatDemoCommentById = async (
  id: number,
  content: string
): Promise<ApiResponse> => {
  try {
    const response = await api.post<ApiResponse>(`/demo/${id}/comments`, {
      content: content,
    });
    return response.data;
  } catch {
    return { success: false, message: "댓글 생성에 실패했습니다." };
  }
};

// 댓글 목록 조회
export const getDemoCommentById = async (id: number): Promise<ApiResponse> => {
  try {
    const response = await api.post<ApiResponse>(`/demo/${id}/comments`);
    return response.data;
  } catch {
    return { success: false, message: "댓글 생성에 실패했습니다." };
  }
};

// 댓글 수정
export const updateDemoCommentByCommentId = async (
  comment: number
): Promise<ApiResponse> => {
  try {
    const response = await api.put<ApiResponse>(`/demo/comments/${comment}`);
    return response.data;
  } catch {
    return { success: false, message: "댓글 생성에 실패했습니다." };
  }
};

// 댓글 수정
export const deleteDemoCommentByCommentId = async (
  comment: number
): Promise<ApiResponse> => {
  try {
    const response = await api.delete<ApiResponse>(`/demo/comments/${comment}`);
    return response.data;
  } catch {
    return { success: false, message: "댓글 생성에 실패했습니다." };
  }
};

// // 댓글 상세 조회
// export const getDemoCommentDetailByCommentId = async (
//   comment: number
// ): Promise<ApiResponse> => {
//   try {
//     const response = await api.get<ApiResponse>(`/demo/comments/${comment}`);
//     return response.data;
//   } catch {
//     return { success: false, message: "댓글 생성에 실패했습니다." };
//   }
// };
