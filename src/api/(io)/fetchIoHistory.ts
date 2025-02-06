// import axios from "axios";
import { dummyIoHistoryResponse, IIoHistory } from "@/types/ioHistory"; // 타입 import

// 입출고 기록 불러오기 API
export const fetchIoHistory = async (): Promise<IIoHistory[]> => {
  // const { data } = await axios.get("/api/io-history"); // 실제 API 엔드포인트로 변경 필요
  // return data;
  return dummyIoHistoryResponse;
};
