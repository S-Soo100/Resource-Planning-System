import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/api/api";
import { authStore } from "@/store/authStore";
import { warehouseApi } from "@/api/warehouse-api";
import { Warehouse } from "@/types/warehouse";

interface UseTeamWarehousesReturn {
  data: Warehouse[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export const useTeamWarehouses = (): UseTeamWarehousesReturn => {
  const currentTeamId = authStore((state) => state.selectedTeam?.id);

  const { data, isLoading, error } = useQuery<ApiResponse<Warehouse[]>, Error>({
    queryKey: ["teamWarehouse", currentTeamId],
    queryFn: () => warehouseApi.getTeamWarehouses(currentTeamId!.toString()),
    enabled: !!currentTeamId,
  });

  return {
    data: data?.data,
    isLoading,
    error,
  };
};
