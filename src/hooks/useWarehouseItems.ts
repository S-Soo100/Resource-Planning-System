import { warehouseApi } from "@/api/warehouse-api";
import { authService } from "@/services/authService";
import { TeamWarehouse } from "@/types/warehouse";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { Warehouse } from "@/types/warehouse";
import { getItemsByWarehouse } from "@/api/item-api";
import { Item } from "@/types/item";
import { ApiResponse } from "@/api/api";

// API 응답에서 받는 창고 데이터 구조
interface ApiWarehouse {
  id: number;
  warehouseName: string;
  warehouseAddress: string;
  teamId: number;
  createdAt: string;
  updatedAt: string;
  team?: {
    id: number;
    teamName: string;
    createdAt: string;
    updatedAt: string;
  };
  items?: Item[];
}

interface useWarehouseItemsReturn {
  isLoading: boolean;
  isError: boolean;
  warehouses: Warehouse[];
  items: Item[];
  invalidateInventory: (warehouseId?: string) => Promise<void>;
}

export function useWarehouseItems(): useWarehouseItemsReturn {
  const queryClient = useQueryClient();
  const selectedTeam = authService.getSelectedTeam();

  if (!selectedTeam || selectedTeam.warehouses === undefined) {
    throw new Error("선택된 팀이 없거나 팀의 창고 정보가 없습니다.");
  }

  // 1. 창고 목록 가져오기
  const warehouses: TeamWarehouse[] = selectedTeam.warehouses;
  const warehouseIds = warehouses.map((w) => w.id);
  const hasWarehouses = warehouseIds.length > 0;

  // 2-1. 창고 정보 가져오기
  const warehouseQueries = useQueries({
    queries: warehouseIds.map((id) => ({
      queryKey: ["warehouse", id],
      queryFn: () => warehouseApi.getWarehouse(id),
      enabled: hasWarehouses,
      staleTime: 1800000, // 30분
    })),
  });

  // 2-2. 각 창고별 아이템 정보 가져오기
  const itemQueries = useQueries({
    queries: warehouseIds.map((id) => ({
      queryKey: ["items", id],
      queryFn: () => getItemsByWarehouse(id),
      enabled: hasWarehouses,
      staleTime: 1800000, // 30분
    })),
  });

  // 쿼리 상태 계산
  const isLoading =
    warehouseQueries.some((q) => q.isLoading) ||
    itemQueries.some((q) => q.isLoading);
  const isError =
    warehouseQueries.some((q) => q.isError) ||
    itemQueries.some((q) => q.isError);
  // const isAllWarehouseSuccess = warehouseQueries.every((q) => q.isSuccess);
  const isAllItemsSuccess = itemQueries.every((q) => q.isSuccess);
  const isAllWarehouseSuccess = warehouseQueries.every((q) => q.isSuccess);

  // 3. 데이터 가공
  const itemsData =
    isAllItemsSuccess && hasWarehouses
      ? itemQueries.flatMap((q) => (q.data?.data ? q.data.data : []))
      : [];

  // 창고 데이터 가공 및 검증
  const warehousesData =
    isAllWarehouseSuccess && hasWarehouses
      ? warehouseQueries
          .map((q) => q.data)
          .filter(
            (response): response is ApiResponse<{ data: Warehouse }> =>
              response !== undefined &&
              response.success === true &&
              !!response.data
          )
          .map((response) => response.data!.data as Warehouse)
      : [];

  // API 응답 구조를 Warehouse 타입에 맞게 변환
  const formattedWarehouses = warehousesData.map((warehouse) => {
    const apiData = warehouse as unknown as ApiWarehouse;
    return {
      id: apiData.id,
      warehouseName: apiData.warehouseName,
      description: "",
      teamId: apiData.teamId,
      team: apiData.team || { id: apiData.teamId, teamName: "" },
      items: apiData.items || [],
      warehouseAddress: apiData.warehouseAddress,
      createdAt: apiData.createdAt,
      updatedAt: apiData.updatedAt,
    } as Warehouse;
  });

  // 캐시 무효화 함수
  const invalidateInventory = async (warehouseId?: string) => {
    const invalidateCache = async (key: string, id?: string) => {
      await queryClient.invalidateQueries({
        queryKey: id ? [key, id] : [key],
      });
    };

    if (warehouseId) {
      // 특정 창고의 캐시만 무효화
      await invalidateCache("warehouse", warehouseId);
      await invalidateCache("items", warehouseId);
    } else {
      // 모든 창고 캐시 무효화
      await invalidateCache("warehouse");
      await invalidateCache("items");
    }
  };

  return {
    isLoading,
    isError,
    warehouses: formattedWarehouses,
    items: itemsData,
    invalidateInventory,
  };
}
