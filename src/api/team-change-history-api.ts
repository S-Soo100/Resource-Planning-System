/**
 * 팀 변경 이력 API
 */

import { api } from './api';
import type { TeamHistoryEvent, EntityType } from '@/types/change-history';

/**
 * 팀 변경 이력 응답 타입
 */
export interface TeamChangeHistoryResponse {
  success: boolean;
  data: TeamHistoryEvent[];
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

/**
 * 팀 변경 이력 조회 파라미터
 */
export interface GetTeamChangeHistoryParams {
  /** 팀 ID */
  teamId: number;
  /** 필터링할 엔티티 타입 */
  types?: EntityType[];
  /** 페이지 번호 */
  page?: number;
  /** 페이지당 항목 수 */
  limit?: number;
}

/**
 * 팀 변경 이력 조회
 * @param params 조회 파라미터
 * @returns 팀 변경 이력 목록
 */
export const getTeamChangeHistory = async (
  params: GetTeamChangeHistoryParams
): Promise<TeamChangeHistoryResponse> => {
  try {
    const { teamId, types, page = 1, limit = 50 } = params;

    // 쿼리 파라미터 생성
    const queryParams = new URLSearchParams();
    if (types && types.length > 0) {
      queryParams.append('types', types.join(','));
    }
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    const queryString = queryParams.toString();
    const url = `/change-history/team/${teamId}${queryString ? `?${queryString}` : ''}`;

    const response = await api.get<TeamChangeHistoryResponse>(url);
    return response.data;
  } catch (error) {
    console.error('[API] 팀 변경 이력 조회 오류:', error);
    return {
      success: false,
      data: [],
      message: '팀 변경 이력을 불러오는데 실패했습니다.',
    };
  }
};
