/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createItem,
  getAllItemsByTeamId as getAllItemsByTeamId,
  getItem,
  updateItem as updateItemApi,
  deleteItem as deleteItemApi,
  updateItemQuantity as updateItemQuantityApi,
} from "@/api/item-api";
import { warehouseApi } from "@/api/warehouse-api";
import {
  CreateItemApiRequest,
  UpdateItemRequest,
  UpdateItemQuantityRequest,
  ItemsResponse,
} from "@/types/(item)/item";
import toast from "react-hot-toast";
import { authStore } from "@/store/authStore";

export function useItemStockManagement(warehouseId?: string) {
  const queryClient = useQueryClient();

  // 모든 아이템 조회 (검색어와 창고ID 기반)
  const useGetItemsByTeam = () => {
    const currentTeamId = authStore((state) => state.selectedTeam?.id);
    return useQuery({
      queryKey: ["items", { currentTeamId }],
      queryFn: () => getAllItemsByTeamId(currentTeamId!.toString()),
      enabled: !!currentTeamId,
      staleTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    });
  };

  // 창고별 아이템 조회 (팀 전체 아이템에서 필터링)
  const useGetItemsByWarehouse = (specificWarehouseId?: string) => {
    const targetWarehouseId = specificWarehouseId || warehouseId;
    const { data: teamItems, ...rest } = useGetItemsByTeam();

    return {
      ...rest,
      data: {
        success: true,
        data:
          (teamItems as ItemsResponse)?.data?.filter(
            (item) => item.warehouseId === Number(targetWarehouseId)
          ) || [],
      },
    };
  };

  // 개별 아이템 조회
  const useGetItem = (itemId: string) => {
    return useQuery({
      queryKey: ["item", itemId],
      queryFn: () => getItem(itemId),
      enabled: !!itemId,
      staleTime: 30 * 60 * 1000, // 5분
      refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 방지
      refetchOnMount: false, // 컴포넌트 마운트 시 자동 refetch 방지
      refetchOnReconnect: false,
    });
  };

  // 아이템 추가 뮤테이션
  const useAddItem = () => {
    return useMutation({
      mutationFn: (item: CreateItemApiRequest) => {
        return createItem(item);
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
          const currentTeamId = authStore.getState().selectedTeam?.id;

          // useWarehouseItems에서 사용하는 쿼리 키와 일치하도록 수정
          queryClient.invalidateQueries({
            queryKey: ["allWarehouses", currentTeamId],
          });

          // 팀 정보도 함께 무효화
          queryClient.invalidateQueries({
            queryKey: ["team", currentTeamId],
          });

          // 기존 쿼리 키들도 함께 무효화 (다른 컴포넌트에서 사용할 수 있음)
          queryClient.invalidateQueries({
            queryKey: ["items"],
          });

          // 특정 아이템 쿼리 무효화
          queryClient.invalidateQueries({
            queryKey: ["item", variables.id],
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
    useGetItems: useGetItemsByTeam,
    useGetItemsByWarehouse,
    useGetItem,
    useAddItem,
    useUpdateItem,
    useUpdateItemQuantity,
    useDeleteItem,
  };
}
