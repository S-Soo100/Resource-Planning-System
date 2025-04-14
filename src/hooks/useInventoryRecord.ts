import { InventoryRecord } from "@/types/inventory-record";

interface UseInventoryRecordReturn {
  records: InventoryRecord[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export const useInventoryRecord = (): UseInventoryRecordReturn => {
  const { data: records, isLoading, error } = useQuery<InventoryRecord[]>({


  return { records, isLoading, isError };
};
