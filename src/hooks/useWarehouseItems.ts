import { warehouseApi } from "@/api/warehouse-api";
import { TeamWarehouse } from "@/types/warehouse";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Warehouse } from "@/types/warehouse";
import { Item } from "@/types/(item)/item";
import { authStore } from "@/store/authStore";
import { teamApi } from "@/api/team-api";

interface useWarehouseItemsReturn {
  isLoading: boolean;
  isError: boolean;
  warehouses: Warehouse[];
  items: Item[];
  invalidateInventory: () => Promise<void>;
  refetchAll: () => Promise<void>;
}

interface WarehousesData {
  warehouses: Warehouse[];
  items: Item[];
}

export function useWarehouseItems(): useWarehouseItemsReturn {
  const queryClient = useQueryClient();
  const selectedTeamId = authStore((state) => state.selectedTeam?.id);

  // 팀 정보를 React Query로 관리
  const { data: selectedTeam } = useQuery({
    queryKey: ["team", selectedTeamId],
    queryFn: async () => {
      if (!selectedTeamId) return null;
      const response = await teamApi.getTeam(Number(selectedTeamId));
      return response.success ? response.data : null;
    },
    enabled: !!selectedTeamId,
    staleTime: 5 * 60 * 1000, // 5분으로 감소
    gcTime: 10 * 60 * 1000, // 10분으로 설정
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  // 팀 및 창고 데이터 준비
  const hasValidTeam = selectedTeam && selectedTeam.warehouses !== undefined;
  const warehouses: TeamWarehouse[] = hasValidTeam
    ? selectedTeam.warehouses
    : [];
  const warehouseIds = warehouses.map((w) => w.id);
  const hasWarehouses = warehouseIds.length > 0;

  // 모든 창고의 아이템 정보를 한 번에 가져오기
  const { data: allWarehousesData } = useQuery<WarehousesData>({
    queryKey: ["allWarehouses", selectedTeamId],
    queryFn: async () => {
      if (!hasWarehouses) return { warehouses: [], items: [] };

      // 모든 창고 정보 가져오기 (items 배열 포함)
      const warehousePromises = warehouseIds.map((id) =>
        warehouseApi.getWarehouse(id)
      );
      const warehouseResponses = await Promise.all(warehousePromises);
      const warehouses = warehouseResponses
        .filter((response) => response.success && response.data)
        .map((response) => response.data!.data as Warehouse);

      // 창고 데이터에서 items 배열 추출
      const items = warehouses.flatMap((warehouse) => warehouse.items || []);

      return { warehouses, items };
    },
    enabled: hasWarehouses,
    staleTime: 5 * 60 * 1000, // 5분으로 감소
    gcTime: 10 * 60 * 1000, // 10분으로 설정
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  // 캐시 무효화 함수
  const invalidateInventory = async () => {
    if (!hasValidTeam) return;

    await queryClient.invalidateQueries({
      queryKey: ["team", selectedTeamId],
    });

    await queryClient.invalidateQueries({
      queryKey: ["allWarehouses", selectedTeamId],
    });
  };

  // 모든 쿼리 직접 리페치하는 함수
  const refetchAll = async () => {
    if (!hasValidTeam || !hasWarehouses) return;

    await queryClient.refetchQueries({
      queryKey: ["team", selectedTeamId],
    });

    await queryClient.refetchQueries({
      queryKey: ["allWarehouses", selectedTeamId],
    });
  };

  const isLoading = !allWarehousesData;
  const isError = false;

  return {
    isLoading,
    isError,
    warehouses: allWarehousesData?.warehouses || [],
    items: allWarehousesData?.items || [],
    invalidateInventory,
    refetchAll,
  };
}
