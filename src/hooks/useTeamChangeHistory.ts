/**
 * 팀 변경 이력 조회 React Query 훅
 */

import { useQuery } from '@tanstack/react-query';
import { getTeamChangeHistory, type GetTeamChangeHistoryParams } from '@/api/team-change-history-api';
import type { TeamChangeHistoryResponse } from '@/api/team-change-history-api';

/**
 * 팀 변경 이력 조회 (폴링 방식)
 * @param params 조회 파라미터
 * @param options 옵션
 */
export const useTeamChangeHistory = (
  params: GetTeamChangeHistoryParams,
  options: {
    enabled?: boolean;
    refetchInterval?: number; // 폴링 간격 (밀리초)
  } = {}
) => {
  const { enabled = true, refetchInterval = 10000 } = options; // 기본 10초 폴링

  return useQuery<TeamChangeHistoryResponse>({
    queryKey: ['teamChangeHistory', params.teamId, params.types, params.page, params.limit],
    queryFn: () => getTeamChangeHistory(params),
    enabled: !!params.teamId && enabled,
    refetchInterval, // 주기적으로 폴링
    staleTime: 0, // 항상 최신 데이터 가져오기
    gcTime: 5 * 60 * 1000, // 5분
  });
};
