import { warehouseApi } from "@/api/warehouse-api";
import { TeamWarehouse } from "@/types/warehouse";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Warehouse } from "@/types/warehouse";
import { Item } from "@/types/(item)/item";
import { authStore } from "@/store/authStore";
import { teamApi } from "@/api/team-api";
import { filterAccessibleWarehouses } from "@/utils/warehousePermissions";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMemo } from "react";

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

interface UseWarehouseItemsOptions {
  enabled?: boolean; // 조건부 실행을 위한 옵션
  staleTime?: number; // 캐시 유지 시간 (기본값: 10분)
  gcTime?: number; // 가비지 컬렉션 시간 (기본값: 30분)
}

export function useWarehouseItems(
  options: UseWarehouseItemsOptions = {}
): useWarehouseItemsReturn {
  const { 
    enabled = true, 
    staleTime = 10 * 60 * 1000, // 10분
    gcTime = 30 * 60 * 1000 // 30분
  } = options;
  
  const queryClient = useQueryClient();
  const selectedTeamId = authStore((state) => state.selectedTeam?.id);
  const { user } = useCurrentUser();

  // 더 엄격한 조건부 실행
  const shouldEnableQueries = enabled && !!selectedTeamId && !!user;

  // 팀 정보를 React Query로 관리
  const { data: selectedTeam } = useQuery({
    queryKey: ["team", selectedTeamId],
    queryFn: async () => {
      if (!selectedTeamId) return null;
      const response = await teamApi.getTeam(Number(selectedTeamId));
      return response.success ? response.data : null;
    },
    enabled: shouldEnableQueries,
    staleTime: 0, // 임시: 항상 fresh하게
    gcTime,
    refetchOnWindowFocus: true, // 임시: 포커스 시 재조회
    refetchOnMount: true, // 임시: 마운트 시 재조회
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
    enabled: shouldEnableQueries && hasWarehouses,
    staleTime: 0, // 임시: 항상 fresh하게
    gcTime,
    refetchOnWindowFocus: true, // 임시: 포커스 시 재조회
    refetchOnMount: true, // 임시: 마운트 시 재조회
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

  // 사용자 권한에 따른 창고 필터링
  const accessibleWarehouses = useMemo(() => {
    if (!user || !allWarehousesData?.warehouses) return [];
    return filterAccessibleWarehouses(user, allWarehousesData.warehouses);
  }, [user, allWarehousesData?.warehouses]);

  // 접근 가능한 창고의 아이템만 필터링
  const accessibleItems = useMemo(() => {
    if (!user || !allWarehousesData?.items) return [];
    return allWarehousesData.items.filter((item) =>
      accessibleWarehouses.some(
        (warehouse) => warehouse.id === item.warehouseId
      )
    );
  }, [user, allWarehousesData?.items, accessibleWarehouses]);

  return {
    isLoading,
    isError,
    warehouses: accessibleWarehouses,
    items: accessibleItems,
    invalidateInventory,
    refetchAll,
  };
}
