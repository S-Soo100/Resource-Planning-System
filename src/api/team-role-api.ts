/* eslint-disable @typescript-eslint/no-unused-vars */
import { api, ApiResponse } from "./api";
import {
  TeamRoleResponse,
  UpdateTeamRoleRequest,
  WarehouseAccessResponse,
} from "@/types/team";

/**
 * 팀별 역할/권한 API
 *
 * @description 백엔드 TEAM_ROLE_API 문서 기반 구현 (v2.3)
 * @see docs/2.3. backend/TEAM_ROLE_API.md
 */
export const teamRoleApi = {
  /**
   * 팀별 유효 권한 조회
   *
   * @description 사용자의 특정 팀에서의 유효 권한을 조회합니다.
   * - TeamUserMap에 팀별 권한이 설정되어 있으면 팀별 권한 사용
   * - 팀별 권한이 없으면 User 테이블 권한으로 폴백
   *
   * @param teamId - 팀 ID
   * @param userId - 사용자 ID
   * @returns 팀별 유효 권한 (accessLevel, isAdmin, restrictedWhs)
   *
   * @example
   * const role = await teamRoleApi.getTeamRole(1, 5);
   * if (role.data?.isAdmin) {
   *   // 관리자 권한 처리
   * }
   */
  getTeamRole: async (
    teamId: number,
    userId: number
  ): Promise<ApiResponse<TeamRoleResponse>> => {
    try {
      const response = await api.get<{
        success: boolean;
        data: TeamRoleResponse;
      }>(`/team-role/${teamId}/user/${userId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: "팀별 권한 조회에 실패했습니다.",
      };
    }
  },

  /**
   * 팀별 권한 수정
   *
   * @description 사용자의 특정 팀에서의 권한을 수정합니다.
   * - 모든 필드 선택적(optional) - 변경할 필드만 전송
   * - count가 0이면 해당 팀에 소속되지 않은 사용자
   *
   * @param teamId - 팀 ID
   * @param userId - 사용자 ID
   * @param data - 수정할 권한 정보 (accessLevel, isAdmin, restrictedWhs)
   * @returns 수정된 레코드 수
   *
   * @example
   * await teamRoleApi.updateTeamRole(1, 5, {
   *   accessLevel: "moderator",
   *   isAdmin: false,
   *   restrictedWhs: "1,3"
   * });
   */
  updateTeamRole: async (
    teamId: number,
    userId: number,
    data: UpdateTeamRoleRequest
  ): Promise<ApiResponse<{ count: number }>> => {
    try {
      const response = await api.patch<{
        success: boolean;
        data: { count: number };
      }>(`/team-role/${teamId}/user/${userId}`, data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: "팀별 권한 수정에 실패했습니다.",
      };
    }
  },

  /**
   * 창고 접근 권한 확인
   *
   * @description 사용자가 특정 팀의 특정 창고에 접근 가능한지 확인합니다.
   * - isAdmin이 true → 항상 접근 가능
   * - restrictedWhs가 null → 제한 없음, 접근 가능
   * - restrictedWhs에 warehouseId가 포함 → 접근 가능
   * - 그 외 → 접근 거부
   *
   * @param teamId - 팀 ID
   * @param userId - 사용자 ID
   * @param warehouseId - 확인할 창고 ID
   * @returns 접근 가능 여부 (canAccess)
   *
   * @example
   * const access = await teamRoleApi.checkWarehouseAccess(1, 5, 3);
   * if (access.data?.canAccess) {
   *   // 창고 접근 허용
   * }
   */
  checkWarehouseAccess: async (
    teamId: number,
    userId: number,
    warehouseId: number
  ): Promise<ApiResponse<WarehouseAccessResponse>> => {
    try {
      const response = await api.get<{
        success: boolean;
        data: WarehouseAccessResponse;
      }>(
        `/team-role/${teamId}/user/${userId}/warehouse-access?warehouseId=${warehouseId}`
      );
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: "창고 접근 권한 확인에 실패했습니다.",
      };
    }
  },
};
