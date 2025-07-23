import { useQuery } from "@tanstack/react-query";
import { getDemoByTeamId, getDemoById } from "../../api/demo-api";

// 30분 캐싱 설정 (밀리초 단위)
const CACHE_TIME = 30 * 60 * 1000;

// 팀별 데모 조회
export const useDemosByTeam = (teamId: number) => {
  return useQuery({
    queryKey: ["demos", "team", teamId],
    queryFn: () => getDemoByTeamId(teamId),
    enabled: !!teamId,
    staleTime: CACHE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 방지
    refetchOnMount: true, // 컴포넌트 마운트 시 자동 refetch 활성화
    refetchOnReconnect: false,
  });
};

// 단일 데모 조회
export const useSingleDemo = (demoId: number) => {
  return useQuery({
    queryKey: ["demo", demoId],
    queryFn: () => getDemoById(demoId),
    enabled: !!demoId,
    staleTime: CACHE_TIME, // 30분 동안 데이터를 신선한 상태로 유지
    gcTime: CACHE_TIME, // 30분 동안 캐시 유지
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 방지
    refetchOnMount: false, // 컴포넌트 마운트 시 자동 refetch 방지
    refetchOnReconnect: false,
  });
};
