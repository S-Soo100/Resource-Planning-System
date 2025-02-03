// import axios from "axios";
import { Iitem, inventoryDummyData } from "@/types/item";

// 재고 목록을 가져오는 API 호출 함수
export const fetchItems = async (): Promise<Iitem[]> => {
  // const { data } = await axios.get("/api"); //! 실제 API 엔드포인트로 변경 필요
  // return data;
  return inventoryDummyData;
};
