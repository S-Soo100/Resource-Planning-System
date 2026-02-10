'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface WithAuthOptions {
  allowedLevels?: string[];
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
  unauthorizedComponent?: React.ReactNode;
}

/**
 * 권한 체크를 위한 HOC (Higher-Order Component)
 *
 * @param Component - 래핑할 컴포넌트
 * @param options - 권한 체크 옵션
 * @param options.allowedLevels - 허용된 권한 레벨 배열 (기본값: 모든 로그인 사용자)
 * @param options.redirectTo - 권한 없을 때 리다이렉트할 경로 (기본값: '/menu')
 * @param options.loadingComponent - 커스텀 로딩 컴포넌트
 * @param options.unauthorizedComponent - 커스텀 권한 없음 컴포넌트
 *
 * @example
 * // 모든 로그인 사용자 허용
 * export default withAuth(MyPage);
 *
 * @example
 * // Admin, Moderator만 허용
 * export default withAuth(AdminPage, {
 *   allowedLevels: ['admin', 'moderator']
 * });
 *
 * @example
 * // Supplier 제외하고 모두 허용
 * export default withAuth(SalesPage, {
 *   allowedLevels: ['admin', 'moderator', 'user']
 * });
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const {
    allowedLevels,
    redirectTo = '/menu',
    loadingComponent,
    unauthorizedComponent,
  } = options;

  return function AuthenticatedComponent(props: P) {
    const router = useRouter();
    const { user, isLoading } = useCurrentUser();

    // 로딩 상태
    if (isLoading) {
      if (loadingComponent) {
        return <>{loadingComponent}</>;
      }

      return (
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      );
    }

    // 로그인 체크
    if (!user) {
      if (unauthorizedComponent) {
        return <>{unauthorizedComponent}</>;
      }

      return (
        <div className="container mx-auto p-6">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                로그인이 필요합니다
              </h2>
              <p className="text-gray-600 mb-6">
                이 페이지는 로그인 후 이용할 수 있습니다.
              </p>
              <button
                onClick={() => router.push(redirectTo)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                메인으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 권한 레벨 체크 (allowedLevels가 지정된 경우만)
    if (allowedLevels && !allowedLevels.includes(user.accessLevel)) {
      if (unauthorizedComponent) {
        return <>{unauthorizedComponent}</>;
      }

      return (
        <div className="container mx-auto p-6">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                접근 권한이 필요합니다
              </h2>
              <p className="text-gray-600 mb-6">
                이 페이지는 관리자만 접근할 수 있습니다.
              </p>
              <button
                onClick={() => router.push(redirectTo)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                메인으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 권한이 있으면 컴포넌트 렌더링
    return <Component {...props} />;
  };
}
