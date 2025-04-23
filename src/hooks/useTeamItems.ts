import { useState, useEffect } from "react";
import { teamItemsApi } from "@/api/team-items-api";
import { TeamItem } from "@/types/team-item";
import { authStore } from "@/store/authStore";

interface UseTeamItemsResult {
  teamItems: TeamItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTeamItems = (): UseTeamItemsResult => {
  const [teamItems, setTeamItems] = useState<TeamItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const selectedTeamId = authStore((state) => state.selectedTeam?.id);

  const fetchTeamItems = async () => {
    if (!selectedTeamId) {
      setError("선택된 팀이 없습니다.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const teamIdNumber = parseInt(selectedTeamId, 10);
      const response = await teamItemsApi.getTeamItemsByTeam(teamIdNumber);
      if (response.success && response.data) {
        setTeamItems(response.data);
      } else {
        setError(response.error || "알 수 없는 오류가 발생했습니다.");
      }
    } catch {
      setError("팀 아이템을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTeamId) {
      fetchTeamItems();
    }
  }, [selectedTeamId]);

  return {
    teamItems,
    isLoading,
    error,
    refetch: fetchTeamItems,
  };
};
