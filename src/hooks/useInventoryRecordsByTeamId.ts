import { useQuery } from "@tanstack/react-query";
import { inventoryRecordApi } from "../api/inventory-record-api";
import { InventoryRecordsResponse } from "../types/(inventoryRecord)/inventory-record";
import { authStore } from "@/store/authStore";
import { useTeamItems } from "@/hooks/useTeamItems";

export function useInventoryRecordsByTeamId() {
  const selectedTeamId = authStore((state) => state.selectedTeam?.id);

  // 현재 팀의 teamItem 목록 가져오기
  const { useGetTeamItems } = useTeamItems();
  const { teamItems } = useGetTeamItems();

  const query = useQuery<InventoryRecordsResponse, Error>({
    queryKey: ["inventoryRecordsByTeam", selectedTeamId],
    queryFn: async () => {
      if (!selectedTeamId) {
        return {
          success: false,
          data: [],
        };
      }

      const response = await inventoryRecordApi.getInventoryRecordsByTeamId(
        selectedTeamId
      );

      // 디버깅용 로그 - 원본 데이터
      console.log(
        `🔍 [TEAM ${selectedTeamId}] 입출고 내역 조회 결과 (${
          response.data?.length || 0
        }개):`,
        response.data
      );
      console.log(
        `📋 현재 팀의 TeamItem 목록 (${teamItems?.length || 0}개):`,
        teamItems
      );

      // 팀의 teamItem 기반 필터링
      if (response.data && teamItems) {
        const originalCount = response.data.length;

        // 현재 팀의 teamItem ID 목록 생성
        const teamItemIds = new Set(teamItems.map((item) => item.id));
        console.log(`📌 팀 TeamItem IDs:`, Array.from(teamItemIds));

        // 현재 팀의 teamItem에 등록된 item만 필터링
        const filteredData = response.data.filter((record) => {
          const recordTeamItemId = record.item?.teamItem?.id;
          const isValidTeamItem = teamItemIds.has(recordTeamItemId);

          if (!isValidTeamItem) {
            console.warn(`❌ 다른 팀의 아이템 제외:`, {
              recordId: record.id,
              itemId: record.item?.id,
              teamItemId: recordTeamItemId,
              itemName: record.item?.teamItem?.itemName,
              itemCode: record.item?.teamItem?.itemCode,
            });
          }

          return isValidTeamItem;
        });

        const filteredCount = filteredData.length;
        const excludedCount = originalCount - filteredCount;

        console.log(
          `✅ 필터링 완료: 전체 ${originalCount}개 → 우리 팀 ${filteredCount}개 (제외 ${excludedCount}개)`
        );

        // 필터링된 데이터로 응답 수정
        return {
          ...response,
          data: filteredData,
        };
      }

      return response;
    },
    enabled: !!selectedTeamId && !!teamItems, // teamItems도 로드된 후에 실행
    staleTime: 5 * 60 * 1000, // 5분으로 감소
    gcTime: 10 * 60 * 1000, // 10분으로 설정
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1, // 재시도 횟수 제한
  });

  return {
    records: query.data?.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
