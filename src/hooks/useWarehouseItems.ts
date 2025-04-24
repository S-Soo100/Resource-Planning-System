import { warehouseApi } from "@/api/warehouse-api";
import { authService } from "@/services/authService";
import { TeamWarehouse } from "@/types/warehouse";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { Warehouse } from "@/types/warehouse";
import { getItemsByWarehouse } from "@/api/item-api";
import { Item } from "@/types/item";
import { ApiResponse } from "@/api/api";
import { useEffect, useMemo } from "react";
import { authStore } from "@/store/authStore";

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
  refetchAll: () => Promise<void>;
}

export function useWarehouseItems(): useWarehouseItemsReturn {
  const queryClient = useQueryClient();
  const selectedTeam = authService.getSelectedTeam();
  // Zustand 상태값 변화 감지를 위해 구독
  const zustandSelectedTeam = authStore((state) => state.selectedTeam);

  // 팀 및 창고 데이터 준비
  const hasValidTeam = selectedTeam && selectedTeam.warehouses !== undefined;
  const warehouses: TeamWarehouse[] = hasValidTeam
    ? selectedTeam.warehouses
    : [];
  const warehouseIds = warehouses.map((w) => w.id);
  const hasWarehouses = warehouseIds.length > 0;

  // 2-1. 창고 정보 가져오기
  const warehouseQueries = useQueries({
    queries: warehouseIds.map((id) => ({
      queryKey: ["warehouse", id, zustandSelectedTeam?.id],
      queryFn: () => warehouseApi.getWarehouse(id),
      enabled: !!(hasWarehouses && hasValidTeam),
      staleTime: 300000, // 5분에서 300초로 줄임
    })),
  });

  // 2-2. 각 창고별 아이템 정보 가져오기
  const itemQueries = useQueries({
    queries: warehouseIds.map((id) => ({
      queryKey: ["items", id, zustandSelectedTeam?.id],
      queryFn: () => getItemsByWarehouse(id),
      enabled: !!(hasWarehouses && hasValidTeam),
      staleTime: 300000, // 5분에서 300초로 줄임
    })),
  });

  // 모든 쿼리 직접 리페치하는 함수
  const refetchAll = async () => {
    if (!hasValidTeam || !hasWarehouses) return;

    // 팀 정보 먼저 리페치
    await queryClient.refetchQueries({
      queryKey: ["currentTeam"],
    });

    // 창고 정보 리페치
    const refetchPromises = [
      ...warehouseQueries.map((query) => query.refetch()),
      ...itemQueries.map((query) => query.refetch()),
    ];

    await Promise.all(refetchPromises);
  };

  // zustandSelectedTeam이 변경될 때마다 자동 refetch
  useEffect(() => {
    if (zustandSelectedTeam && hasValidTeam) {
      console.log(
        "useWarehouseItems: zustandSelectedTeam이 변경됨, 자동 refetch"
      );
      const refetchData = async () => {
        try {
          // 모든 쿼리 리페치
          await refetchAll();
        } catch (error) {
          console.error("자동 refetch 중 오류 발생:", error);
        }
      };

      refetchData();
    }
  }, [zustandSelectedTeam, refetchAll, hasValidTeam]);

  // 캐시 무효화 함수
  const invalidateInventory = async (warehouseId?: string) => {
    if (!hasValidTeam) return;

    const invalidateCache = async (key: string, id?: string) => {
      await queryClient.invalidateQueries({
        queryKey: id ? [key, id] : [key],
      });
    };

    // 팀 정보도 함께 최신화
    await queryClient.invalidateQueries({
      queryKey: ["currentTeam"],
    });

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

  // 쿼리 상태 계산
  const isLoading =
    warehouseQueries.some((q) => q.isLoading) ||
    itemQueries.some((q) => q.isLoading);
  const isError =
    warehouseQueries.some((q) => q.isError) ||
    itemQueries.some((q) => q.isError);
  const isAllItemsSuccess = itemQueries.every((q) => q.isSuccess);
  const isAllWarehouseSuccess = warehouseQueries.every((q) => q.isSuccess);

  // 3. 데이터 가공
  const itemsData =
    isAllItemsSuccess && hasWarehouses && hasValidTeam
      ? itemQueries.flatMap((q) => (q.data?.data ? q.data.data : []))
      : [];

  // 창고 데이터 가공 및 검증
  const warehousesData =
    isAllWarehouseSuccess && hasWarehouses && hasValidTeam
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
  const formattedWarehouses = useMemo(() => {
    return warehousesData.map((warehouse) => {
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
  }, [warehousesData]);

  // 팀 선택 없는 경우 기본값 반환
  if (!hasValidTeam) {
    return {
      isLoading: false,
      isError: false,
      warehouses: [],
      items: [],
      invalidateInventory,
      refetchAll,
    };
  }

  return {
    isLoading,
    isError,
    warehouses: formattedWarehouses,
    items: itemsData,
    invalidateInventory,
    refetchAll,
  };
}
