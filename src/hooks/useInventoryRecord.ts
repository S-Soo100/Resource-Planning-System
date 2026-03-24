import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  inventoryRecordApi,
  updateInventoryRecord,
  updateInboundStatus,
} from "../api/inventory-record-api";
import {
  CreateInventoryRecordDto,
  InventoryRecord,
  UpdateInventoryRecordRequest,
} from "../types/(inventoryRecord)/inventory-record";
import { ApiResponse } from "../types/common";

// 입출고 기록 생성 mutation 훅
export function useCreateInventoryRecord() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ApiResponse<{ data: InventoryRecord } | InventoryRecord>,
    Error,
    CreateInventoryRecordDto
  >({
    mutationFn: (data: CreateInventoryRecordDto) =>
      inventoryRecordApi.createInventoryRecord(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        // 성공 메시지
        const record =
          "data" in response.data ? response.data.data : response.data;
        const actionType = record.inboundQuantity ? "입고" : "출고";
        toast.success(`${actionType}가 성공적으로 처리되었습니다.`);

        // 입출고 기록 캐시 무효화 - ioHistory 페이지와 관련 데이터 갱신
        queryClient.invalidateQueries({
          queryKey: ["inventoryRecordsByTeam"],
        });
      } else {
        toast.error(response.error || "처리 중 오류가 발생했습니다.");
      }
    },
    onError: (error) => {
      toast.error("처리 중 오류가 발생했습니다.");
      console.error(error);
    },
  });

  return {
    createInventoryRecord: mutation.mutate,
    createInventoryRecordAsync: async (data: CreateInventoryRecordDto) => {
      const response = await mutation.mutateAsync(data);
      // console.log("API 응답 전체:", response);
      // console.log("API 응답 data:", response.data);

      if (response.success && response.data) {
        // data가 중첩된 구조일 수 있으므로 data.data에서 id를 추출
        const record =
          "data" in response.data ? response.data.data : response.data;
        const recordId = record.id;
        console.log("추출된 recordId:", recordId);

        if (typeof recordId === "number") {
          return recordId;
        }
      }
      throw new Error(response.error || "처리 중 오류가 발생했습니다.");
    },
    ...mutation,
  };
}

// 파일 업로드 mutation 훅
export function useUploadInventoryRecordFile() {
  const mutation = useMutation<
    ApiResponse<{ url: string }>,
    Error,
    { recordId: number; file: File }
  >({
    mutationFn: ({ recordId, file }) =>
      inventoryRecordApi.uploadSingleFile(recordId, file),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("파일이 성공적으로 업로드되었습니다.");
      } else {
        toast.error(response.error || "파일 업로드 중 오류가 발생했습니다.");
      }
    },
    onError: (error) => {
      toast.error("파일 업로드 중 오류가 발생했습니다.");
      console.error(error);
    },
  });

  return {
    uploadFile: mutation.mutate,
    uploadFileAsync: mutation.mutateAsync,
    isUploading: mutation.isPending,
    ...mutation,
  };
}

// 입출고 기록 수정 mutation 훅
export function useUpdateInventoryRecord() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ApiResponse<InventoryRecord>,
    Error,
    { id: string; data: UpdateInventoryRecordRequest }
  >({
    mutationFn: ({ id, data }) => updateInventoryRecord(id, data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("입출고 기록이 성공적으로 수정되었습니다.");

        // 입출고 기록 캐시 무효화
        queryClient.invalidateQueries({
          queryKey: ["inventoryRecordsByTeam"],
        });
      } else {
        toast.error(response.error || "수정 중 오류가 발생했습니다.");
      }
    },
    onError: (error) => {
      toast.error("수정 중 오류가 발생했습니다.");
      console.error(error);
    },
  });

  return {
    updateInventoryRecord: mutation.mutate,
    updateInventoryRecordAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    ...mutation,
  };
}

// 입고 상태 변경 mutation 훅 (v4.0)
export function useUpdateInboundStatus() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ApiResponse<InventoryRecord>,
    Error,
    { id: number }
  >({
    mutationFn: ({ id }) => updateInboundStatus(id, "completed"),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("입고가 완료 처리되었습니다.");

        // 입출고 기록 캐시 무효화
        queryClient.invalidateQueries({
          queryKey: ["inventoryRecordsByTeam"],
        });
        // 품목 평균원가 갱신 반영
        queryClient.invalidateQueries({
          queryKey: ["teamItems"],
        });
        // 마진 분석 갱신 반영
        queryClient.invalidateQueries({
          queryKey: ["margin-analysis"],
        });
        // 재고 현황 캐시 무효화 (창고별 아이템 목록)
        queryClient.invalidateQueries({
          queryKey: ["team"],
        });
        queryClient.invalidateQueries({
          queryKey: ["allWarehouses"],
        });
        queryClient.invalidateQueries({
          queryKey: ["items", "warehouse"],
        });
      } else {
        toast.error(response.error || "입고 상태 변경 중 오류가 발생했습니다.");
      }
    },
    onError: () => {
      toast.error("입고 상태 변경 중 오류가 발생했습니다.");
    },
  });

  return {
    updateInboundStatus: mutation.mutate,
    updateInboundStatusAsync: mutation.mutateAsync,
    isUpdatingInboundStatus: mutation.isPending,
  };
}
