// import { warehouseApi } from "@/api/warehouse-api";
// import { authService } from "@/services/authService";
// import { IWarehouse } from "@/types/warehouse";
// import { useQueries } from "@tanstack/react-query";
// import { Warehouse } from "@/types/warehouse";
// import { Item } from "@/types/item";

// interface UseItemsReturn {
//   data: { warehouseId: number; items: Item[] }[] | undefined;
//   isLoading: boolean;
//   error: Error | null;
// }

// export const useItems = (): UseItemsReturn => {
//   // team의 창고 id목록 가져오기
//   const team = authService.getSelectedTeam();
//   if (!team || !team.Warehouses) {
//     throw new Error("팀 정보를 찾을 수 없습니다.");
//   }
//   const warehouseIds = team.Warehouses.map((warehouse) => warehouse.id);

//   // 창고 id목록 기반으로 재고 쿼리 옵션 배열 생성
//   const { data, isLoading, isError } = useQuery({
//     queryKey: ["items"],
//     queryFn: () => fetchItems(),
//   });
// };
