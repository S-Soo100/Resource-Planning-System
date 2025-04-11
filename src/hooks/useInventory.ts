import { warehouseApi } from "@/api/warehouse-api";
import { authService } from "@/services/authService";
import { TeamWarehouse } from "@/types/warehouse";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { Warehouse } from "@/types/warehouse";
import { getItemsByWarehouse } from "@/api/item-api";
import { Item } from "@/types/item";

interface UseInventoryReturn {
  isLoading: boolean;
  isError: boolean;
  warehouses: Warehouse[];
  items: Item[];
  invalidateInventory: (warehouseId?: string) => Promise<void>;
}

export function useInventory(): UseInventoryReturn {
  const queryClient = useQueryClient();
  const selectedTeam = authService.getSelectedTeam();

  if (!selectedTeam || selectedTeam.Warehouses === undefined) {
    throw new Error("선택된 팀이 없거나 팀의 창고 정보가 없습니다.");
  }

  // 1. 창고 목록 가져오기
  const warehouses: TeamWarehouse[] = selectedTeam.Warehouses;
  const warehouseIds = warehouses.map((w) => w.id);
  const hasWarehouses = warehouseIds.length > 0;

  // 2-1. 창고 정보 가져오기
  const warehouseQueries = useQueries({
    queries: warehouseIds.map((id) => ({
      queryKey: ["warehouse", id],
      queryFn: () => warehouseApi.getWarehouse(id.toString()),
      enabled: hasWarehouses,
      staleTime: 1800000, // 30분
    })),
  });

  // 2-2. 각 창고별 아이템 정보 가져오기
  const itemQueries = useQueries({
    queries: warehouseIds.map((id) => ({
      queryKey: ["items", id],
      queryFn: () => getItemsByWarehouse(id.toString()),
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
  const isAllWarehouseSuccess = warehouseQueries.every((q) => q.isSuccess);
  const isAllItemsSuccess = itemQueries.every((q) => q.isSuccess);

  // 3. 데이터 가공
  const warehouseData =
    isAllWarehouseSuccess && hasWarehouses
      ? warehouseQueries.flatMap((q) => (q.data?.data ? [q.data.data] : []))
      : [];

  const itemsData =
    isAllItemsSuccess && hasWarehouses
      ? itemQueries.flatMap((q) => (q.data?.data ? q.data.data : []))
      : [];

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
    warehouses: warehouseData,
    items: itemsData,
    invalidateInventory,
  };
}
