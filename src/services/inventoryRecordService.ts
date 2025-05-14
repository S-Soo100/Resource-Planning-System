import { createInventoryRecord } from "@/api/inventory-record-api";
import { CreateInventoryRecordDto } from "@/types/(inventoryRecord)/inventory-record";

export const inventoryRecordService = {
  createInventoryRecord: async (
    data: CreateInventoryRecordDto,
    onSuccess?: () => void
  ) => {
    try {
      const response = await createInventoryRecord(data);
      if (response.success) {
        onSuccess?.();
      }
      return response;
    } catch (error) {
      console.error("입출고 기록 생성 실패:", error);
      return {
        success: false,
        error: "입출고 기록 생성에 실패했습니다.",
      };
    }
  },
};
