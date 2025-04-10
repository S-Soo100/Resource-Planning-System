import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/api/api";
import { warehouseApi } from "@/api/warehouse-api";
import { Warehouse } from "@/types/warehouse";

interface UseWarehouseReturn {
  data: Warehouse | undefined;
  isLoading: boolean;
  error: Error | null;
}

export const useWarehouse = ({
  warehouseId,
}: {
  warehouseId: string;
}): UseWarehouseReturn => {
  const { data, isLoading, error } = useQuery<ApiResponse<Warehouse>, Error>({
    queryKey: ["warehouse", warehouseId],
    queryFn: () => warehouseApi.getWarehouse(warehouseId!.toString()),
    enabled: !!warehouseId,
  });

  return {
    data: data?.data,
    isLoading,
    error,
  };
};
