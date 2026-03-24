import { useQuery } from "@tanstack/react-query";
import { searchBySerialCode } from "@/api/order-api";
import { authStore } from "@/store/authStore";

/**
 * 시리얼코드 검색 훅 (v4.0)
 * 시리얼코드로 발주 내역을 검색한다.
 *
 * @param code 검색할 시리얼코드 (빈 문자열이면 비활성화)
 */
export const useSerialSearch = (code: string) => {
  const selectedTeam = authStore((state) => state.selectedTeam);
  const teamId = selectedTeam?.id ?? 0;

  const trimmedCode = code.trim();

  return useQuery({
    queryKey: ["serial-search", { code: trimmedCode, teamId }],
    queryFn: async () => {
      if (!teamId || !trimmedCode) {
        return [];
      }

      const response = await searchBySerialCode(trimmedCode, teamId);
      if (!response.success) {
        throw new Error(response.message || "시리얼코드 검색에 실패했습니다.");
      }

      return response.data ?? [];
    },
    enabled: !!teamId && !!trimmedCode,
    staleTime: 1000 * 60 * 2, // 2분
  });
};
