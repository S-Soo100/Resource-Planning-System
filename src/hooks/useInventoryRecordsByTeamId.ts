import { useQuery } from "@tanstack/react-query";
import { inventoryRecordApi } from "../api/inventory-record-api";
import { InventoryRecordsResponse } from "../types/(inventoryRecord)/inventory-record";
import { authStore } from "@/store/authStore";

export function useInventoryRecordsByTeamId() {
  const selectedTeamId = authStore((state) => state.selectedTeam?.id);

  const query = useQuery<InventoryRecordsResponse, Error>({
    queryKey: ["inventoryRecordsByTeam", selectedTeamId],
    queryFn: async () => {
      if (!selectedTeamId) {
        return {
          success: false,
          data: [],
        };
      }
      return inventoryRecordApi.getInventoryRecordsByTeamId(selectedTeamId);
    },
    enabled: !!selectedTeamId,
    staleTime: 30 * 60 * 1000, // 30분
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 비활성화
    refetchOnMount: false, // 컴포넌트 마운트 시 자동 refetch 비활성화
    refetchOnReconnect: false,
  });

  return {
    records: query.data?.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
