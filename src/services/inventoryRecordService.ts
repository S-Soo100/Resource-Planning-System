import { createInventoryRecord } from "@/api/inventory-record-api";
import { CreateInventoryRecordRequest } from "@/types/inventory-record";

export const inventoryRecordService = {
  createInventoryRecord: async (
    data: CreateInventoryRecordRequest,
    invalidateCache?: (warehouseId?: string) => Promise<void>
  ) => {
    try {
      const response = await createInventoryRecord(data);

      // 성공적으로 레코드가 생성되었다면, 관련 쿼리 데이터 무효화
      if (response.success && invalidateCache) {
        // warehouseId가 있으면 해당 창고의 데이터만 무효화
        const warehouseId = response.data?.warehouseId?.toString();
        await invalidateCache(warehouseId);
        return true;
      }

      return response.success || false;
    } catch (error) {
      console.error("재고 기록 생성 중 오류 발생:", error);
      return false;
    }
  },
};
