import { useQuery } from "@tanstack/react-query";
import { IIoHistory } from "@/types/ioHistory";
import { fetchIoHistory } from "@/api/(io)/fetchIoHistory";

// 입출고 기록을 불러오는 커스텀 훅
export const useIoHistory = () => {
  console.log("useIoHistory");
  return useQuery<IIoHistory[]>({
    queryKey: ["ioHistory"], // 캐싱을 위한 키
    queryFn: fetchIoHistory, // API 호출 함수
    staleTime: 1000 * 60 * 5, // 5분 동안 캐싱 유지
    refetchOnWindowFocus: false, // 창이 포커스될 때 자동 새로고침 방지
  });
};
