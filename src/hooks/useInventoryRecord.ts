import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryRecordApi } from "../api/inventory-record-api";
import {
  InventoryRecord,
  CreateInventoryRecordDto,
} from "../types/inventory-record";
import { ApiResponse } from "../types/common";

// 입출고 기록 생성 mutation 훅
export function useCreateInventoryRecord() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ApiResponse<InventoryRecord>,
    Error,
    CreateInventoryRecordDto
  >({
    mutationFn: (data: CreateInventoryRecordDto) =>
      inventoryRecordApi.createInventoryRecord(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        // 성공 메시지
        const actionType = response.data.inboundQuantity ? "입고" : "출고";
        toast.success(`${actionType}가 성공적으로 처리되었습니다.`);

        // 입출고 기록 캐시 무효화
        queryClient.invalidateQueries({
          queryKey: ["warehouseInventoryRecords"],
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
    createInventoryRecordAsync: mutation.mutateAsync,
    ...mutation,
  };
}
