'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from './useCurrentUser';
import toast from 'react-hot-toast';

interface UseRequireAuthOptions {
  allowedLevels?: string[];
  redirectTo?: string;
  showToast?: boolean;
}

/**
 * 권한 체크를 위한 커스텀 훅
 *
 * @param options - 권한 체크 옵션
 * @param options.allowedLevels - 허용된 권한 레벨 배열 (기본값: 모든 로그인 사용자)
 * @param options.redirectTo - 권한 없을 때 리다이렉트할 경로 (기본값: '/menu')
 * @param options.showToast - 권한 없을 때 토스트 메시지 표시 여부 (기본값: true)
 *
 * @returns { user, isLoading, isAuthorized } - 사용자 정보, 로딩 상태, 권한 여부
 *
 * @example
 * // 모든 로그인 사용자 허용
 * const { user, isLoading, isAuthorized } = useRequireAuth();
 *
 * @example
 * // Admin, Moderator만 허용
 * const { user, isLoading, isAuthorized } = useRequireAuth({
 *   allowedLevels: ['admin', 'moderator']
 * });
 *
 * @example
 * // Supplier 제외하고 모두 허용 (판매/구매 페이지)
 * const { user, isLoading, isAuthorized } = useRequireAuth({
 *   allowedLevels: ['admin', 'moderator', 'user']
 * });
 *
 * @example
 * // 권한 없을 때 토스트 없이 리다이렉트만
 * const { user, isLoading, isAuthorized } = useRequireAuth({
 *   allowedLevels: ['admin'],
 *   showToast: false
 * });
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { allowedLevels, redirectTo = '/menu', showToast = true } = options;
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (isLoading) return;

    // 로그인 안 된 경우
    if (!user) {
      if (showToast) {
        toast.error('로그인이 필요합니다.');
      }
      router.push(redirectTo);
      return;
    }

    // 권한 레벨 체크 (allowedLevels가 지정된 경우만)
    if (allowedLevels && !allowedLevels.includes(user.accessLevel)) {
      if (showToast) {
        toast.error(`접근 권한이 없습니다. (현재 권한: ${user.accessLevel})`);
      }
      router.push(redirectTo);
      return;
    }
  }, [user, isLoading, allowedLevels, redirectTo, showToast, router]);

  // 권한이 있는지 여부
  const isAuthorized = user
    ? allowedLevels
      ? allowedLevels.includes(user.accessLevel)
      : true
    : false;

  return {
    user,
    isLoading,
    isAuthorized,
  };
}
