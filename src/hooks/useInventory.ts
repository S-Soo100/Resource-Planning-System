import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// 만약 inventoryList가 객체 배열이라면
interface InventoryItem {
  id: number;
  name: string;
  // ... 기타 속성
}

const fetchInventoryList = async () => {
  const { data } = await axios.get("/api/inventory");
  return data;
};

export const useInventoryList = () => {
  const { isLoading, error, data } = useQuery<InventoryItem[]>(
    ["inventoryList"],
    fetchInventoryList
  );

  // ...
};
