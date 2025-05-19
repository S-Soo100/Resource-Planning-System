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
    staleTime: 300000, // 5분
  });

  return {
    records: query.data?.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
