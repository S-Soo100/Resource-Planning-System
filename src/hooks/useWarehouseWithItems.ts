import { useState } from "react";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import { Item } from "@/types/item";
import { getItemsByWarehouse } from "@/api/item-api";
import { ApiResponse } from "@/types/common";

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

      // 창고 아이템 데이터 로드
      const response = await getItemsByWarehouse(warehouseId.toString());

      if (response.success && response.data) {
        // API 응답 데이터를 Item[] 타입으로 안전하게 변환
        const items = Array.isArray(response.data)
          ? (response.data as Item[])
          : [];

        // 상태 업데이트
        setWarehouseItems((prev) => ({
          ...prev,
          [warehouseId.toString()]: items,
        }));

        return response;
      }

      return response;
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
