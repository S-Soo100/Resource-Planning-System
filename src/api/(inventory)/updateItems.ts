import axios from "axios";
import { Iitem } from "@/types/item";

export interface UpdateItemPayload {
  itemId: number;
  itemQuantity: number;
}

// 재고 수정 API 함수
export const updateItem = async ({
  itemId,
  itemQuantity,
}: UpdateItemPayload): Promise<Iitem> => {
  const { data } = await axios.patch(`/api/inventory/${itemId}`, {
    itemQuantity,
  });
  return data;
};
