import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Iitem } from "@/types/item";
// import { fetchItems } from "@/api/(item)/fetchItems";

// 재고 목록을 가져오는 커스텀 훅
export const useItems = (): UseQueryResult<Iitem[], Error> => {
  console.log("useItems");
  return useQuery<Iitem[]>({
    queryKey: ["items"], // 캐싱을 위한 키
    // queryFn: fetchItems, // API 호출 함수
    staleTime: 1000 * 60 * 30, // 30분 동안 캐싱 유지
    refetchOnWindowFocus: false, // 창이 포커스될 때 다시 불러오지 않음
  });
};
