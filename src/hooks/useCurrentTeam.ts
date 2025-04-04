import { useQuery } from "@tanstack/react-query";
import { teamApi } from "@/api/team-api";
import { Team } from "@/types/team";
import { ApiResponse } from "@/api/api";
import { getCurrentTeam } from "@/api/cookie-api";

interface UseCurrentTeamReturn {
  team: Team | undefined;
  isLoading: boolean;
  error: Error | null;
}

export const useCurrentTeam = (): UseCurrentTeamReturn => {
  // const { user } = useCurrentUser();
  const currentTeamId = getCurrentTeam();

  const {
    data: teamData,
    isLoading,
    error,
  } = useQuery<ApiResponse<Team>, Error>({
    queryKey: ["currentTeam", currentTeamId],
    queryFn: () => teamApi.getTeam(currentTeamId!.toString()),
    enabled: !!currentTeamId,
  });

  return {
    team: teamData?.data,
    isLoading,
    error,
  };
};
