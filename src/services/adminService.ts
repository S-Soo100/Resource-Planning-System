import { warehouseApi } from "@/api/warehouse-api";
import { CreateWarehouseDto } from "@/types/warehouse";
import { QueryClient } from "@tanstack/react-query";

export const adminService = {
  createWarehouse: async (
    warehouse: CreateWarehouseDto,
    queryClient?: QueryClient
  ): Promise<boolean> => {
    try {
      const response = await warehouseApi.createWarehouse(warehouse);

      // API 통신 성공 시 currentTeam 쿼리 무효화
      if (response.success && queryClient) {
        queryClient.invalidateQueries({ queryKey: ["currentTeam"] });
      }

      return response.success;
    } catch (error) {
      console.error("창고 추가 중 오류 발생:", error);
      return false;
    }
  },
};
