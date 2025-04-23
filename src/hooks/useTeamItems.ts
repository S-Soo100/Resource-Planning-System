import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamItemsApi } from "@/api/team-items-api";
import { TeamItem, CreateTeamItemDto } from "@/types/team-item";
import { authStore } from "@/store/authStore";
import toast from "react-hot-toast";

export function useTeamItems() {
  const queryClient = useQueryClient();
  const selectedTeamId = authStore((state) => state.selectedTeam?.id);

  // 팀 아이템 목록 조회
  const useGetTeamItems = () => {
    const query = useQuery<TeamItem[]>({
      queryKey: ["teamItems", selectedTeamId],
      queryFn: async () => {
        if (!selectedTeamId) {
          throw new Error("선택된 팀이 없습니다.");
        }

        const teamIdNumber = parseInt(selectedTeamId, 10);
        const response = await teamItemsApi.getTeamItemsByTeam(teamIdNumber);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error || "팀 아이템 목록 조회에 실패했습니다");
      },
      enabled: !!selectedTeamId,
      staleTime: 5 * 60 * 1000, // 5분
    });

    return {
      teamItems: query.data,
      ...query,
    };
  };

  // 팀 아이템 생성 뮤테이션
  const useCreateTeamItem = () => {
    const mutation = useMutation({
      mutationFn: (teamItemDto: CreateTeamItemDto) =>
        teamItemsApi.createTeamItem(teamItemDto),
      onSuccess: (response) => {
        if (response.success) {
          // 캐시 무효화
          queryClient.invalidateQueries({
            queryKey: ["teamItems", selectedTeamId],
          });
          toast.success("팀 아이템이 생성되었습니다.");
        } else {
          toast.error(response.error || "팀 아이템 생성에 실패했습니다.");
        }
      },
      onError: () => {
        toast.error("팀 아이템 생성 중 오류가 발생했습니다.");
      },
    });

    return {
      createTeamItem: mutation.mutate,
      createTeamItemAsync: mutation.mutateAsync,
      ...mutation,
    };
  };

  return {
    useGetTeamItems,
    useCreateTeamItem,
  };
}
