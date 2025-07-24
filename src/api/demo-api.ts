import { api } from "./api";
import { ApiResponse } from "../types/common";
import {
  DemoArrayResponse,
  DemoDetailResponse,
  CreateDemoRequest,
  PatchDemoRequest,
} from "@/types/demo/demo";
import { AxiosError } from "axios";

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

export const getDemoById = async (
  demoId: number
): Promise<ApiResponse<DemoDetailResponse>> => {
  try {
    const response = await api.get<ApiResponse<DemoDetailResponse>>(
      `/demo/${demoId}`
    );
    return response.data;
  } catch {
    return { success: false, message: "시연 상세 조회에 실패했습니다." };
  }
};

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
  id: number,
  data: PatchDemoRequest
): Promise<ApiResponse> => {
  try {
    const response = await api.patch<ApiResponse>(`/demo/${id}`, data);
    return response.data;
  } catch {
    return { success: false, message: "시연 기록 수정에 실패했습니다." };
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

export const deleteDemoById = async (id: number): Promise<ApiResponse> => {
  try {
    const response = await api.delete<ApiResponse>(`/demo/${id}`);
    return response.data;
  } catch {
    return { success: false, message: "시연 신청 삭제에 실패했습니다." };
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

// 시연 파일 업로드 API
export const uploadMultipleDemoFileById = async (
  id: number,
  files: File[],
  expirationTimeMinutes: number = 30
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<ApiResponse<any[]>> => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("expirationTimeMinutes", expirationTimeMinutes.toString());

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.post<ApiResponse<any[]>>(
      `/demo/${id}/upload-multiple-with-signed-url`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return response.data as ApiResponse<any[]>;
  } catch (error) {
    console.error("시연 파일 업로드 실패:", error);
    if (error instanceof AxiosError && error.response) {
      return {
        success: false,
        error:
          error.response.data.message || "시연 파일 업로드에 실패했습니다.",
        data: undefined,
      };
    }
    return {
      success: false,
      error: "시연 파일 업로드에 실패했습니다.",
      data: undefined,
    };
  }
};

// 시연 파일 삭제 API
export const deleteDemoFile = async (
  demoId: number,
  fileId: number
): Promise<ApiResponse> => {
  try {
    const response = await api.delete<ApiResponse>(
      `/demo/${demoId}/files/${fileId}`
    );
    return response.data;
  } catch (error) {
    console.error("시연 파일 삭제 실패:", error);
    if (error instanceof AxiosError && error.response) {
      return {
        success: false,
        error: error.response.data.message || "시연 파일 삭제에 실패했습니다.",
      };
    }
    return {
      success: false,
      error: "시연 파일 삭제에 실패했습니다.",
    };
  }
};
