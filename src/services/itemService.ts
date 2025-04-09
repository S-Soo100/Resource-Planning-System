import {
  createItem,
  getAllItems,
  updateItem as updateItemApi,
  deleteItem as deleteItemApi,
} from "@/api/item-api";
import { CreateItemRequest, UpdateItemRequest } from "@/types/item";
import { ApiResponse } from "@/types/common";

export const itemService = {
  getItems: async (search?: string, warehouseId?: string) => {
    const response = await getAllItems(search, warehouseId);
    return response;
  },

  addItem: async (item: CreateItemRequest) => {
    const response = await createItem(item);
    return response;
  },

  updateItem: async (id: string, data: UpdateItemRequest) => {
    const response = await updateItemApi(id, data);
    return response;
  },

  deleteItem: async (id: string) => {
    const response = await deleteItemApi(id);
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
