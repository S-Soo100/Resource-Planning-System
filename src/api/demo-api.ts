import { api } from "./api";
import { ApiResponse } from "../types/common";
import { normalizeFileName } from "@/utils/fileUtils";
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
    // 시연 생성은 복잡한 작업이므로 더 긴 타임아웃 설정 (30초)
    const response = await api.post<ApiResponse>("/demo", demoData, {
      timeout: 30000,
    });
    return response.data;
  } catch (error: unknown) {
    console.error("[API] 시연 생성 오류:", error);

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
  } catch (error: unknown) {
    console.error("[API] 시연 상태 변경 오류:", error);

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
      message: "시연 상태 변경에 실패했습니다.",
    };
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
    const response = await api.get<ApiResponse>(`/demo/${id}/comments`);
    return response.data;
  } catch {
    return { success: false, message: "댓글 조회에 실패했습니다." };
  }
};

// 댓글 수정
export const updateDemoCommentByCommentId = async (
  commentId: number,
  data: { content: string }
): Promise<ApiResponse> => {
  try {
    const response = await api.patch<ApiResponse>(
      `/demo/comments/${commentId}`,
      data
    );
    return response.data;
  } catch {
    return { success: false, message: "댓글 수정에 실패했습니다." };
  }
};

// 댓글 삭제
export const deleteDemoCommentByCommentId = async (
  commentId: number
): Promise<ApiResponse> => {
  try {
    const response = await api.delete<ApiResponse>(
      `/demo/comments/${commentId}`
    );
    return response.data;
  } catch {
    return { success: false, message: "댓글 삭제에 실패했습니다." };
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
    console.log("[데모 파일 업로드 API] 업로드 시작:", {
      demoId: id,
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

      console.log(`[데모 파일 업로드 API] 파일 ${index + 1} 처리:`, {
        original: originalName,
        normalized: normalizedFileName,
        isChanged: originalName !== normalizedFileName,
      });

      formData.append("files", normalizedFile);
    });
    formData.append("expirationTimeMinutes", expirationTimeMinutes.toString());

    console.log("[데모 파일 업로드 API] 서버 전송:", {
      demoId: id,
      normalizedFileNames: files.map((f) => normalizeFileName(f)),
    });

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

    console.log("[데모 파일 업로드 API] 서버 응답:", {
      success: response.data.success,
      fileCount: response.data.data?.length,
      fileNames: response.data.data?.map(
        (f: { fileName: string }) => f.fileName
      ),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return response.data as ApiResponse<any[]>;
  } catch (error) {
    console.error("[데모 파일 업로드 API] 오류:", error);
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
