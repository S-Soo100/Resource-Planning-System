import { ApiResponse } from "@/api/api";
import { getAllInventoryRecords } from "@/api/inventory-record-api";
import { InventoryRecord } from "@/types/inventory-record";
import { useQuery } from "@tanstack/react-query";

interface UseInventoryRecordReturn {
  records: InventoryRecord[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export const useInventoryRecord = (): UseInventoryRecordReturn => {
  const { data, isLoading, error } = useQuery<
    ApiResponse<InventoryRecord[]>,
    Error
  >({
    queryKey: ["inventory-records"],
    queryFn: () => getAllInventoryRecords(),
  });

  return { records: data?.data, isLoading, error };
};
