import { useQuery } from "@tanstack/react-query";
import { teamApi } from "@/api/team-api";
import { Team } from "@/types/team";
import { ApiResponse } from "@/api/api";
import { authStore } from "@/store/authStore";
// import { getCurrentTeam } from "@/api/cookie-api";

interface UseCurrentTeamReturn {
  team: Team | undefined;
  isLoading: boolean;
  error: Error | null;
}

export const useCurrentTeam = (): UseCurrentTeamReturn => {
  const currentTeamId = authStore((state) => state.selectedTeam?.id);
  const {
    data: teamData,
    isLoading,
    error,
  } = useQuery<ApiResponse<Team>, Error>({
    queryKey: ["currentTeam", currentTeamId],
    queryFn: () => teamApi.getTeam(currentTeamId!),
    enabled: !!currentTeamId,
    staleTime: 5 * 60 * 1000, // 5분 동안 데이터를 신선한 상태로 유지
    gcTime: 30 * 60 * 1000, // 30분 동안 캐시 유지
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 방지
    refetchOnMount: false, // 컴포넌트 마운트 시 자동 refetch 방지
  });

  return {
    team: teamData?.data,
    isLoading,
    error,
  };
};
