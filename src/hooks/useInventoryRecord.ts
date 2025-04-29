import toast from "react-hot-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { inventoryRecordApi } from "../api/inventory-record-api";
import {
  InventoryRecord,
  CreateInventoryRecordDto,
  InventoryRecordsResponse,
} from "../types/inventory-record";
import { ApiResponse } from "../types/common";

// 입출고 기록 생성 mutation 훅
export function useCreateInventoryRecord() {
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

// 창고별 입출고 기록 조회 훅
export function useGetWarehouseInventoryRecords(
  warehouseId: number,
  startDate?: string,
  endDate?: string
) {
  const query = useQuery<InventoryRecordsResponse, Error>({
    queryKey: ["warehouseInventoryRecords", warehouseId, startDate, endDate],
    queryFn: () =>
      inventoryRecordApi.getInventoryRecords(warehouseId, startDate, endDate),
    enabled: !!warehouseId,
    staleTime: 300000, // 5분
  });

  console.log("Query Data:", query.data);
  console.log("Query Success:", query.isSuccess);

  // API 응답 구조에 맞게 데이터 추출
  const records = query.data?.data || [];
  console.log("Extracted Records:", records);

  return {
    records,
    isLoading: query.isLoading,
    error: query.error,
  };
}

// 아이템별 입출고 기록 조회 훅
export function useGetItemInventoryRecords(
  itemId: number,
  startDate?: string,
  endDate?: string
) {
  const query = useQuery<ApiResponse<InventoryRecord[]>>({
    queryKey: ["inventoryRecords", "item", itemId, startDate, endDate],
    queryFn: () =>
      inventoryRecordApi.getItemInventoryRecords(itemId, startDate, endDate),
  });

  return {
    records: query.data?.success ? query.data.data : [],
    ...query,
  };
}
