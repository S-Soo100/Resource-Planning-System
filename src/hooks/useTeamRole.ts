import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamRoleApi } from "@/api/team-role-api";
import {
  TeamRoleResponse,
  UpdateTeamRoleRequest,
  WarehouseAccessResponse,
} from "@/types/team";
import toast from "react-hot-toast";

/**
 * 팀별 역할/권한 관리를 위한 커스텀 훅
 *
 * @description 백엔드 TEAM_ROLE_API 문서 기반 구현 (v2.3)
 * @see docs/2.3. backend/TEAM_ROLE_API.md
 *
 * @param teamId - 팀 ID
 * @param userId - 사용자 ID
 *
 * @example
 * const { teamRole, isLoading, updateRole } = useTeamRole(1, 5);
 *
 * // 권한 확인
 * if (teamRole?.isAdmin) {
 *   // 관리자 권한 처리
 * }
 *
 * // 권한 수정
 * await updateRole({
 *   accessLevel: "moderator",
 *   isAdmin: false,
 *   restrictedWhs: "1,3"
 * });
 */
export const useTeamRole = (teamId: number, userId: number) => {
  const queryClient = useQueryClient();

  // 팀별 유효 권한 조회
  const {
    data: teamRoleData,
    isLoading,
    error,
  } = useQuery<TeamRoleResponse>({
    queryKey: ["team-role", teamId, userId],
    queryFn: async () => {
      const response = await teamRoleApi.getTeamRole(teamId, userId);
      if (!response.success || !response.data) {
        throw new Error(response.error || "팀별 권한 조회에 실패했습니다.");
      }
      return response.data;
    },
    enabled: !!teamId && !!userId,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });

  // 팀별 권한 수정
  const updateRoleMutation = useMutation({
    mutationFn: async (data: UpdateTeamRoleRequest) => {
      const response = await teamRoleApi.updateTeamRole(teamId, userId, data);
      if (!response.success || !response.data) {
        throw new Error(response.error || "팀별 권한 수정에 실패했습니다.");
      }
      if (response.data.count === 0) {
        throw new Error("해당 팀에 소속되지 않은 사용자입니다.");
      }
      return response.data;
    },
    onSuccess: () => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["team-role", teamId, userId] });
      queryClient.invalidateQueries({ queryKey: ["team", teamId] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      toast.success("팀별 권한이 성공적으로 수정되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "팀별 권한 수정 중 오류가 발생했습니다.");
    },
  });

  return {
    // 팀별 유효 권한
    teamRole: teamRoleData,

    // 로딩 상태
    isLoading,

    // 에러
    error,

    // 권한 수정 함수
    updateRole: updateRoleMutation.mutateAsync,

    // 권한 수정 중 상태
    isUpdatingRole: updateRoleMutation.isPending,
  };
};

/**
 * 창고 접근 권한 확인을 위한 커스텀 훅
 *
 * @description 사용자가 특정 팀의 특정 창고에 접근 가능한지 확인합니다.
 *
 * @param teamId - 팀 ID
 * @param userId - 사용자 ID
 * @param warehouseId - 확인할 창고 ID
 *
 * @example
 * const { canAccess, isLoading } = useWarehouseAccess(1, 5, 3);
 *
 * if (canAccess) {
 *   // 창고 접근 허용
 * }
 */
export const useWarehouseAccess = (
  teamId: number,
  userId: number,
  warehouseId: number
) => {
  const {
    data: accessData,
    isLoading,
    error,
  } = useQuery<WarehouseAccessResponse>({
    queryKey: ["warehouse-access", teamId, userId, warehouseId],
    queryFn: async () => {
      const response = await teamRoleApi.checkWarehouseAccess(
        teamId,
        userId,
        warehouseId
      );
      if (!response.success || !response.data) {
        throw new Error(
          response.error || "창고 접근 권한 확인에 실패했습니다."
        );
      }
      return response.data;
    },
    enabled: !!teamId && !!userId && !!warehouseId,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });

  return {
    // 접근 가능 여부
    canAccess: accessData?.canAccess || false,

    // 로딩 상태
    isLoading,

    // 에러
    error,
  };
};
