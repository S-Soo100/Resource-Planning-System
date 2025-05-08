import { useState } from "react";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import { Item } from "@/types/item";
import { ApiResponse } from "@/types/common";
import { warehouseApi } from "@/api/warehouse-api";

/**
 * 창고 목록과 창고별 아이템 정보를 관리하는 커스텀 훅
 * @returns 창고 목록, 창고별 아이템, 창고 변경 핸들러
 */
export function useWarehouseWithItems() {
  // 창고 목록 상태
  const { warehouses } = useWarehouseItems();

  // 창고별 아이템 정보를 저장할 객체
  const [warehouseItems, setWarehouseItems] = useState<{
    [warehouseId: string]: Item[];
  }>({});

  // 창고 변경 핸들러
  const handleWarehouseChange = async (
    warehouseId: number
  ): Promise<ApiResponse> => {
    try {
      // 이미 로드된 데이터가 있으면 다시 로드하지 않음
      if (warehouseItems[warehouseId.toString()]) {
        return { success: true, data: warehouseItems[warehouseId.toString()] };
      }

      // 창고 정보 로드 (items 배열 포함)
      const response = await warehouseApi.getWarehouse(warehouseId);

      if (response.success && response.data) {
        // 창고 데이터에서 items 배열 추출
        const items = response.data.data.items || [];

        // 상태 업데이트
        setWarehouseItems((prev) => ({
          ...prev,
          [warehouseId.toString()]: items,
        }));

        return { success: true, data: items };
      }

      return { success: false, message: "창고 아이템 조회에 실패했습니다." };
    } catch (error) {
      console.error("창고 아이템 조회 실패:", error);
      return { success: false, message: "창고 아이템 조회에 실패했습니다." };
    }
  };

  return {
    warehousesList: warehouses || [], // warehouses가 undefined일 경우 빈 배열 반환
    warehouseItems,
    handleWarehouseChange,
  };
}
