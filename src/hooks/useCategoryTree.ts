import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/api/category-api";
import { authStore } from "@/store/authStore";
import { Category } from "@/types/(item)/category";

/**
 * 계층형 카테고리 트리 조회 훅 (v4.0)
 * 부모-자식 구조의 카테고리 트리를 반환한다.
 *
 * @param teamId 팀 ID (미전달 시 현재 선택 팀 사용)
 */
export const useCategoryTree = (teamId?: number) => {
  const selectedTeam = authStore((state) => state.selectedTeam);
  const effectiveTeamId = teamId ?? selectedTeam?.id ?? 0;

  return useQuery<Category[]>({
    queryKey: ["categoryTree", effectiveTeamId],
    queryFn: async () => {
      if (!effectiveTeamId) {
        return [];
      }

      const response = await categoryApi.getCategoryTree(effectiveTeamId);
      if (!response.success) {
        throw new Error(response.error || "카테고리 트리 조회에 실패했습니다.");
      }

      return response.data ?? [];
    },
    enabled: !!effectiveTeamId,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
  });
};
