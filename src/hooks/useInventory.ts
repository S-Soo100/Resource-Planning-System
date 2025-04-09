import { warehouseApi } from "@/api/warehouse-api";
import { authService } from "@/services/authService";
import { IWarehouse } from "@/types/warehouse";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { Warehouse } from "@/types/warehouse";
import { getItemsByWarehouse } from "@/api/item-api";
import { Item } from "@/types/item";

export function useInventory() {
  const queryClient = useQueryClient();

  if (
    !authService.getSelectedTeam() ||
    authService.getSelectedTeam()?.Warehouses === undefined
  ) {
    throw new Error("선택된 팀이 없거나 팀의 창고 정보가 없습니다.");
  }
  // 1. 창고 목록 가져오기
  const wareHouses: IWarehouse[] = authService.getSelectedTeam()!.Warehouses;

  // 2. 창고 목록 기반으로 재고 쿼리 옵션 배열 생성
  const warehouseIds = wareHouses.map((w) => w.id);

  // 3-1. 창고 정보 가져오기
  const warehouseQueries = useQueries({
    queries: warehouseIds.map((id) => ({
      queryKey: ["warehouse", id],
      queryFn: () => warehouseApi.getWarehouse(id.toString()),
      enabled: wareHouses && warehouseIds.length > 0,
      staleTime: 1800000, // 30분
    })),
  });

  // 3-2. 각 창고별 아이템 정보 가져오기
  const itemQueries = useQueries({
    queries: warehouseIds.map((id) => ({
      queryKey: ["items", id],
      queryFn: () => getItemsByWarehouse(id.toString()),
      enabled: wareHouses && warehouseIds.length > 0,
      staleTime: 1800000, // 30분
    })),
  });

  // 로딩 상태 통합
  const isLoading =
    warehouseQueries.some((q) => q.isLoading) ||
    itemQueries.some((q) => q.isLoading);

  // 모든 쿼리 성공 여부 확인
  const isAllWarehouseSuccess = warehouseQueries.every((q) => q.isSuccess);
  const isAllItemsSuccess = itemQueries.every((q) => q.isSuccess);

  // 4. 데이터 가공 및 반환
  let warehouses: Warehouse[] = [];
  let allItems: Item[] = [];

  if (isAllWarehouseSuccess && warehouseIds.length > 0) {
    // 창고 정보 가공
    warehouses = warehouseQueries.flatMap((q) =>
      q.data && q.data.data ? [q.data.data] : []
    );
  }

  if (isAllItemsSuccess && warehouseIds.length > 0) {
    // 아이템 정보 가공
    allItems = itemQueries.flatMap((q) =>
      q.data && q.data.data ? q.data.data : []
    );
  }

  // 디버깅
  console.log("창고 정보:", warehouses);
  console.log("전체 아이템:", allItems);

  // 캐시 무효화 함수
  const invalidateInventory = async (warehouseId?: string) => {
    if (warehouseId) {
      // 특정 창고의 캐시만 무효화
      await queryClient.invalidateQueries({
        queryKey: ["warehouse", warehouseId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["items", warehouseId],
      });
    } else {
      // 모든 창고 캐시 무효화
      await queryClient.invalidateQueries({
        queryKey: ["warehouse"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["items"],
      });
    }
  };

  return {
    isLoading,
    isError:
      warehouseQueries.some((q) => q.isError) ||
      itemQueries.some((q) => q.isError),
    warehouses: warehouses,
    items: allItems,
    invalidateInventory,
  };
}
