import { warehouseApi } from "@/api/warehouse-api";
import { authService } from "@/services/authService";
import { IWarehouse } from "@/types/warehouse";
import { useQueries } from "@tanstack/react-query";
import { Warehouse } from "@/types/warehouse";

export function useAllInventories() {
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

  // 3. useQueries를 사용하여 각 창고 재고 가져오기
  const inventoryQueries = useQueries({
    queries: warehouseIds.map((id) => ({
      queryKey: ["inventory", id], // 각 쿼리에 고유 키 부여
      queryFn: () => warehouseApi.getWarehouse(id.toString()),
      enabled: wareHouses && warehouseIds.length > 0,
    })),
  });

  // 로딩 상태 통합 (창고 목록 로딩 중이거나, 재고 쿼리 중 하나라도 로딩 중일 때)
  const isLoading = inventoryQueries.some((q) => q.isLoading);

  // 모든 재고 쿼리가 성공했는지 확인
  const isAllInventorySuccess = inventoryQueries.every((q) => q.isSuccess);

  // 4. 데이터 가공 및 반환 (모든 쿼리가 성공했을 때)
  let warehouses: Warehouse[] = [];
  if (isAllInventorySuccess && warehouseIds.length > 0) {
    // inventoryQueries의 data 배열을 가공하여 최종 결과 생성
    warehouses = inventoryQueries.flatMap((q) =>
      q.data && q.data.data ? [q.data.data] : []
    );
  }

  return {
    isLoading,
    isError: inventoryQueries.some((q) => q.isError), // 하나라도 에러면 에러 처리
    warehouses: warehouses,
    items: warehouses.flatMap((w) => w.items),
  };
}
