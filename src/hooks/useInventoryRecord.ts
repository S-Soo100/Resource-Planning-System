import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inventoryRecordApi } from "../api/inventory-record-api";
import {
  InventoryRecord,
  CreateInventoryRecordDto,
  InventoryRecordsResponse,
} from "../types/inventory-record";
import { ApiResponse } from "../types/common";
import { authStore } from "@/store/authStore";

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

// 창고별 입출고 기록 조회 훅
export function useGetWarehouseInventoryRecords(
  startDate?: string,
  endDate?: string,
  warehouseId?: number
) {
  const selectedTeamId = authStore((state) => state.selectedTeam?.id);

  const query = useQuery<InventoryRecordsResponse, Error>({
    queryKey: ["warehouseInventoryRecords", selectedTeamId],
    queryFn: async () => {
      if (!selectedTeamId) {
        return {
          success: false,
          data: [],
        };
      }
      // 날짜 필터 없이 모든 데이터를 가져옴
      return inventoryRecordApi.getInventoryRecordsByTeamId(selectedTeamId);
    },
    enabled: !!selectedTeamId,
    staleTime: 300000, // 5분
    select: (data) => {
      let filteredData = data.data;

      // 날짜 필터링
      if (startDate) {
        filteredData = filteredData.filter((record) => {
          const recordDate = record.inboundDate || record.outboundDate;
          return recordDate && new Date(recordDate) >= new Date(startDate);
        });
      }
      if (endDate) {
        filteredData = filteredData.filter((record) => {
          const recordDate = record.inboundDate || record.outboundDate;
          return recordDate && new Date(recordDate) <= new Date(endDate);
        });
      }

      // 창고 필터링
      if (warehouseId) {
        filteredData = filteredData.filter(
          (record) => record.item?.warehouseId === warehouseId
        );
      }

      return {
        ...data,
        data: filteredData,
      };
    },
  });

  return {
    records: query.data?.data || [],
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
