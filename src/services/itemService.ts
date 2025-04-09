import {
  createItem,
  getAllItems,
  updateItem as updateItemApi,
  deleteItem as deleteItemApi,
} from "@/api/item-api";
import {
  CreateItemRequest,
  CreateItemApiRequest,
  UpdateItemRequest,
} from "@/types/item";
import { ApiResponse } from "@/types/common";

export const itemService = {
  getItems: async (search?: string, warehouseId?: string) => {
    const response = await getAllItems(search, warehouseId);
    return response;
  },

  addItem: async (
    item: CreateItemRequest,
    invalidateInventory?: (warehouseId?: string) => Promise<void>
  ) => {
    // API 요구사항에 맞게 데이터 변환
    const apiRequest: CreateItemApiRequest = {
      itemName: item.name,
      itemCode: item.sku,
      itemQuantity: item.quantity,
      warehouseId: item.warehouseId,
    };

    // 변환된 데이터로 API 호출
    const response = await createItem(apiRequest);

    // 성공 시 캐시 무효화
    if (response.success && invalidateInventory) {
      await invalidateInventory(item.warehouseId.toString());
    }

    return response;
  },

  updateItem: async (
    id: string,
    data: UpdateItemRequest,
    invalidateInventory?: (warehouseId?: string) => Promise<void>
  ) => {
    const response = await updateItemApi(id, data);

    // 성공 시 캐시 무효화
    if (response.success && invalidateInventory && data.warehouseId) {
      await invalidateInventory(data.warehouseId);
    }

    return response;
  },

  deleteItem: async (
    id: string,
    warehouseId?: string,
    invalidateInventory?: (warehouseId?: string) => Promise<void>
  ) => {
    const response = await deleteItemApi(id);

    // 성공 시 캐시 무효화
    if (response.success && invalidateInventory && warehouseId) {
      await invalidateInventory(warehouseId);
    }

    return response;
  },
};

// useInventory 훅과 함께 사용할 수 있는 헬퍼 함수
export const withInventoryUpdate = async (
  serviceFunction: () => Promise<ApiResponse>,
  invalidateInventory: (warehouseId?: string) => Promise<void>,
  warehouseId?: string
): Promise<ApiResponse> => {
  const response = await serviceFunction();

  if (response.success) {
    // 작업 성공 시에만 캐시 무효화
    await invalidateInventory(warehouseId);
  }

  return response;
};
