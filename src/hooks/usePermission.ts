"use client";

import { authStore } from "@/store/authStore";
import { useTeamRole } from "./useTeamRole";

type AccessLevel = "user" | "admin" | "supplier" | "moderator";

interface UsePermissionReturn {
  accessLevel: AccessLevel;
  isAdmin: boolean;
  isModerator: boolean;
  isUser: boolean;
  isSupplier: boolean;
  restrictedWhs: string | null;
  // 비즈니스 헬퍼
  isAdminOrModerator: boolean;
  canEditPrice: boolean;
  canApproveOrder: boolean;
  canDeleteRecord: boolean;
  canViewMargin: boolean;
  canViewCostPrice: boolean;
  isReadOnly: boolean;
  // 상태
  isLoading: boolean;
  isReady: boolean;
}

/**
 * 팀 권한 기반 통합 권한 훅
 *
 * authStore에서 selectedTeam.id + user.id를 가져와
 * useTeamRole()을 내부 호출하여 팀 권한 기반 헬퍼를 반환합니다.
 *
 * - 팀 선택 전(signin, team-select): authStore의 accessLevel로 폴백
 * - React Query 캐시(5분) 덕분에 페이지 이동 시 로딩 없음
 */
export function usePermission(): UsePermissionReturn {
  const user = authStore((state) => state.user);
  const selectedTeam = authStore((state) => state.selectedTeam);

  const teamId = selectedTeam?.id ?? 0;
  const userId = user?.id ?? 0;

  const { teamRole, isLoading } = useTeamRole(teamId, userId);

  // 팀 권한이 있으면 사용, 없으면 authStore 폴백
  const accessLevel: AccessLevel =
    teamRole?.accessLevel ?? user?.accessLevel ?? "user";
  const restrictedWhs = teamRole?.restrictedWhs ?? null;

  const isAdmin = accessLevel === "admin";
  const isModerator = accessLevel === "moderator";
  const isUser = accessLevel === "user";
  const isSupplier = accessLevel === "supplier";
  const isAdminOrModerator = isAdmin || isModerator;

  return {
    accessLevel,
    isAdmin,
    isModerator,
    isUser,
    isSupplier,
    restrictedWhs,
    // 비즈니스 헬퍼
    isAdminOrModerator,
    canEditPrice: isAdminOrModerator,
    canApproveOrder: isAdminOrModerator,
    canDeleteRecord: isAdmin,
    canViewMargin: isAdminOrModerator,
    canViewCostPrice: isAdminOrModerator,
    isReadOnly: isModerator,
    // 상태
    isLoading,
    isReady: !isLoading && !!teamRole,
  };
}
