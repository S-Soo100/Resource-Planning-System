import { ApiResponse } from "@/api/api";
import { getAllInventoryRecords } from "@/api/inventory-record-api";
import { ApiInventoryRecord } from "@/types/inventory-record";
import { useQuery } from "@tanstack/react-query";

interface UseInventoryRecordReturn {
  records: ApiInventoryRecord[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export const useInventoryRecord = (): UseInventoryRecordReturn => {
  const { data, isLoading, error } = useQuery<
    ApiResponse<ApiInventoryRecord[]>,
    Error
  >({
    queryKey: ["inventory-records"],
    queryFn: () => getAllInventoryRecords(),
  });

  return { records: data?.data, isLoading, error };
};
