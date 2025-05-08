/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createItem,
  getAllItems,
  getItem,
  updateItem as updateItemApi,
  deleteItem as deleteItemApi,
  updateItemQuantity as updateItemQuantityApi,
} from "@/api/item-api";
import { warehouseApi } from "@/api/warehouse-api";
import {
  CreateItemRequest,
  CreateItemApiRequest,
  UpdateItemRequest,
  UpdateItemQuantityRequest,
} from "@/types/item";
import toast from "react-hot-toast";

export function useItems(warehouseId?: string) {
  const queryClient = useQueryClient();

  // 모든 아이템 조회 (검색어와 창고ID 기반)
  const useGetItems = (search?: string) => {
    return useQuery({
      queryKey: ["items", { search, warehouseId }],
      queryFn: () => getAllItems(search, warehouseId),
      staleTime: 5 * 60 * 1000, // 5분
    });
  };

  // 창고별 아이템 조회 (최적화: /warehouse/{id} API 사용)
  const useGetItemsByWarehouse = (specificWarehouseId?: string) => {
    const targetWarehouseId = specificWarehouseId || warehouseId;
    return useQuery({
      queryKey: ["items", "warehouse", targetWarehouseId],
      queryFn: async () => {
        if (!targetWarehouseId) {
          return { success: true, data: [] };
        }

        // /warehouse/{id} API를 호출하여 창고 정보와 아이템 정보를 한 번에 가져옴
        const response = await warehouseApi.getWarehouse(targetWarehouseId);
        if (response.success && response.data) {
          // 창고 데이터에서 items 배열 추출하여 반환
          return { success: true, data: response.data.data.items || [] };
        }
        return {
          success: false,
          message: "창고별 아이템 조회에 실패했습니다.",
        };
      },
      enabled: !!targetWarehouseId,
      staleTime: 5 * 60 * 1000, // 5분
    });
  };

  // 개별 아이템 조회
  const useGetItem = (itemId: string) => {
    return useQuery({
      queryKey: ["item", itemId],
      queryFn: () => getItem(itemId),
      enabled: !!itemId,
      staleTime: 5 * 60 * 1000, // 5분
    });
  };

  // 아이템 추가 뮤테이션
  const useAddItem = () => {
    return useMutation({
      mutationFn: (item: CreateItemRequest) => {
        // API 요구사항에 맞게 데이터 변환
        const apiRequest: CreateItemApiRequest = {
          itemName: item.name,
          itemCode: item.sku,
          itemQuantity: item.quantity,
          warehouseId: item.warehouseId,
        };
        return createItem(apiRequest);
      },
      onSuccess: (data, variables) => {
        if (data.success) {
          // 캐시 무효화 - 관련된 모든 아이템 쿼리 무효화
          queryClient.invalidateQueries({
            queryKey: ["items"],
          });

          // 특정 창고의 아이템 쿼리도 무효화
          queryClient.invalidateQueries({
            queryKey: ["items", "warehouse", variables.warehouseId.toString()],
          });

          toast.success("아이템이 추가되었습니다.");
        } else {
          toast.error(data.message || "아이템 추가에 실패했습니다.");
        }
      },
    });
  };

  // 아이템 업데이트 뮤테이션
  const useUpdateItem = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateItemRequest }) =>
        updateItemApi(id, data),
      onSuccess: (data, variables) => {
        if (data.success) {
          // 캐시 무효화
          queryClient.invalidateQueries({
            queryKey: ["items"],
          });

          // 특정 아이템 쿼리 무효화
          queryClient.invalidateQueries({
            queryKey: ["item", variables.id],
          });

          // 특정 창고의 아이템 쿼리 무효화
          if (variables.data.warehouseId) {
            queryClient.invalidateQueries({
              queryKey: ["items", "warehouse", variables.data.warehouseId],
            });
          }

          toast.success("아이템이 업데이트되었습니다.");
        } else {
          toast.error(data.message || "아이템 업데이트에 실패했습니다.");
        }
      },
    });
  };

  // 아이템 수량 업데이트 뮤테이션
  const useUpdateItemQuantity = () => {
    return useMutation({
      mutationFn: ({
        id,
        data,
        itemWarehouseId, // 린터가 사용되지 않는다고 표시할 수 있지만, onSuccess에서 variables로 접근하기 위해 필요함
      }: {
        id: string;
        data: UpdateItemQuantityRequest;
        itemWarehouseId: string;
      }) => {
        // API 호출만 수행, itemWarehouseId는 onSuccess에서 캐시 무효화에 사용됨
        return updateItemQuantityApi(id, data);
      },
      onSuccess: (data, variables) => {
        if (data.success) {
          // 캐시 무효화
          queryClient.invalidateQueries({
            queryKey: ["items"],
          });

          // 특정 아이템 쿼리 무효화
          queryClient.invalidateQueries({
            queryKey: ["item", variables.id],
          });

          // 특정 창고의 아이템 쿼리 무효화
          queryClient.invalidateQueries({
            queryKey: ["items", "warehouse", variables.itemWarehouseId],
          });

          toast.success("아이템 수량이 업데이트되었습니다.");
        } else {
          toast.error(data.message || "아이템 수량 업데이트에 실패했습니다.");
        }
      },
    });
  };

  // 아이템 삭제 뮤테이션
  const useDeleteItem = () => {
    return useMutation({
      mutationFn: ({
        id,
        itemWarehouseId, // 린터가 사용되지 않는다고 표시할 수 있지만, onSuccess에서 variables로 접근하기 위해 필요함
      }: {
        id: string;
        itemWarehouseId: string;
      }) => {
        // API 호출만 수행, itemWarehouseId는 onSuccess에서 캐시 무효화에 사용됨
        return deleteItemApi(id);
      },
      onSuccess: (data, variables) => {
        if (data.success) {
          // 캐시 무효화
          queryClient.invalidateQueries({
            queryKey: ["items"],
          });

          // 특정 창고의 아이템 쿼리 무효화
          queryClient.invalidateQueries({
            queryKey: ["items", "warehouse", variables.itemWarehouseId],
          });

          toast.success("아이템이 삭제되었습니다.");
        } else {
          toast.error(data.message || "아이템 삭제에 실패했습니다.");
        }
      },
    });
  };

  return {
    useGetItems,
    useGetItemsByWarehouse,
    useGetItem,
    useAddItem,
    useUpdateItem,
    useUpdateItemQuantity,
    useDeleteItem,
  };
}
