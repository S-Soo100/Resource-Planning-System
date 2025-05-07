import { api, ApiResponse } from "./api";
import {
  CreateInventoryRecordDto,
  UpdateInventoryRecordRequest,
  InventoryRecord,
  InventoryRecordsResponse,
} from "../types/inventory-record";
import { AxiosError } from "axios";
import { authStore } from "@/store/authStore";

// 입출고 기록 생성 함수를 별도로 export
export const createInventoryRecord = async (
  data: CreateInventoryRecordDto
): Promise<ApiResponse<InventoryRecord>> => {
  try {
    // 현재 로그인한 사용자의 ID 가져오기
    const currentUser = authStore.getState().user;
    if (!currentUser) {
      throw new Error("로그인이 필요합니다.");
    }

    // 요청 데이터에 userId 추가
    const requestData = {
      ...data,
      userId: currentUser.id,
    };

    // 요청 데이터 로깅
    console.log("입출고 기록 생성 요청 데이터:", requestData);

    // 파일이 있는 경우 FormData 사용
    if (data.attachedFiles && data.attachedFiles.length > 0) {
      const formData = new FormData();

      // 기본 데이터를 JSON으로 추가
      const basicData = { ...requestData };
      const restData = Object.fromEntries(
        Object.entries(basicData).filter(([key]) => key !== "attachedFiles")
      );
      formData.append("data", JSON.stringify(restData));

      // FormData 내용 로깅
      console.log("FormData 기본 데이터:", restData);
      console.log("첨부 파일 개수:", data.attachedFiles.length);

      // 파일들 추가
      data.attachedFiles.forEach((file: File) => {
        formData.append(`files`, file);
      });

      const response = await api.post<InventoryRecord>(
        "/inventory-record",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("서버 응답 (파일 포함):", response.data);
      return { success: true, data: response.data };
    } else {
      // 파일이 없는 경우 일반 JSON 요청
      const response = await api.post<InventoryRecord>(
        "/inventory-record",
        requestData
      );
      console.log("서버 응답 (파일 없음):", response.data);
      return { success: true, data: response.data };
    }
  } catch (error) {
    console.error("입출고 기록 생성 실패:", error);
    // axios 에러인 경우 응답 데이터 확인
    if (error instanceof AxiosError && error.response) {
      console.error("서버 응답 상태:", error.response.status);
      console.error("서버 응답 데이터:", error.response.data);
      console.error("요청 설정:", error.config);
      return {
        success: false,
        error:
          error.response.data.message || "입출고 기록 생성에 실패했습니다.",
        data: undefined,
      };
    }
    return {
      success: false,
      error: "입출고 기록 생성에 실패했습니다.",
      data: undefined,
    };
  }
};

export const inventoryRecordApi = {
  createInventoryRecord,
  // 입출고 기록 조회
  getInventoryRecordsByTeamId: async (
    teamId: number,
    startDate?: string,
    endDate?: string
  ): Promise<InventoryRecordsResponse> => {
    try {
      const params: Record<string, string> = {};

      if (startDate) {
        params.startDate = startDate;
      }
      if (endDate) {
        params.endDate = endDate;
      }

      console.log("API Request Params:", params);

      const response = await api.get<InventoryRecordsResponse>(
        `/inventory-record/team/${teamId}`,
        {
          params,
        }
      );
      return response.data;
    } catch (error) {
      console.error("입출고 기록 조회 실패:", error);
      if (error instanceof AxiosError && error.response) {
        console.error("요청 설정:", error.config);
      }
      return {
        success: false,
        data: [],
      };
    }
  },

  // 특정 아이템의 입출고 기록 조회
  getItemInventoryRecords: async (
    itemId: number,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<InventoryRecord[]>> => {
    try {
      const params = {
        itemId,
        startDate,
        endDate,
      };

      const response = await api.get<InventoryRecord[]>(
        `/inventory-record/item/${itemId}`,
        {
          params,
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error("아이템 입출고 기록 조회 실패:", error);
      return {
        success: false,
        error: "아이템 입출고 기록 조회에 실패했습니다.",
      };
    }
  },
};

export const getAllInventoryRecords = async (): Promise<
  ApiResponse<InventoryRecord[]>
> => {
  try {
    const response = await api.get<ApiResponse<InventoryRecord[]>>(
      "/inventory-record"
    );
    return response.data;
  } catch {
    return {
      success: false,
      error: "재고 기록 목록 조회에 실패했습니다.",
      data: [],
    };
  }
};

export const getInventoryRecord = async (
  id: string
): Promise<ApiResponse<InventoryRecord>> => {
  try {
    const response = await api.get<ApiResponse<InventoryRecord>>(
      `/inventory-record/${id}`
    );
    return response.data;
  } catch {
    return {
      success: false,
      error: "재고 기록 조회에 실패했습니다.",
      data: undefined,
    };
  }
};

export const updateInventoryRecord = async (
  id: string,
  data: UpdateInventoryRecordRequest
): Promise<ApiResponse<InventoryRecord>> => {
  try {
    const response = await api.patch<ApiResponse<InventoryRecord>>(
      `/inventory-record/${id}`,
      data
    );
    return response.data;
  } catch {
    return {
      success: false,
      error: "재고 기록 수정에 실패했습니다.",
      data: undefined,
    };
  }
};

export const deleteInventoryRecord = async (
  id: string
): Promise<ApiResponse<InventoryRecord>> => {
  try {
    const response = await api.delete<ApiResponse<InventoryRecord>>(
      `/inventory-record/${id}`
    );
    return response.data;
  } catch {
    return {
      success: false,
      error: "재고 기록 삭제에 실패했습니다.",
      data: undefined,
    };
  }
};
