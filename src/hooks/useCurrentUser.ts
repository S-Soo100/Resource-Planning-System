import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/api/user-api";
import { ApiResponse } from "@/api/api";
// import { getAuthCookie } from "@/api/cookie-api";
import { authStore } from "@/store/authStore";
import { IUser } from "@/types/(auth)/user";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Cookies from "js-cookie";

interface UseCurrentUserReturn {
  user: IUser | undefined;
  isLoading: boolean;
  error: Error | null;
}

export const useCurrentUser = (): UseCurrentUserReturn => {
  // const auth = getAuthCookie();
  const auth = authStore((state) => state.user);
  const router = useRouter();
  const pathname = usePathname();

  // /signin 페이지에서만 API 호출하지 않음 (team-select에서는 사용자 정보가 필요)
  const shouldFetchUser = pathname !== "/signin" && !!auth?.id;

  // console.log("API 호출 여부:", shouldFetchUser);

  const {
    data: userData,
    isLoading,
    error,
  } = useQuery<ApiResponse<IUser>, Error>({
    queryKey: ["user", auth?.id],
    queryFn: async () => {
      console.log("userApi.getUser 호출 시작, userId:", auth!.id);
      try {
        const response = await userApi.getUser(auth!.id.toString());
        console.log("userApi.getUser 응답:", response);
        if (!response.success) {
          throw new Error(
            response.error || "사용자 정보를 가져오는데 실패했습니다"
          );
        }
        return response;
      } catch (err: unknown) {
        console.error("사용자 정보 조회 에러:", err);
        const error = err as { response?: { status: number }; message: string };

        // 401 또는 403 에러인 경우 인증 상태 초기화
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log("인증 에러 발생, 로그아웃 처리");
          // 토큰 제거
          localStorage.removeItem("token");
          Cookies.remove("token");
          // authStore 초기화
          authStore.getState().logout();
          // 현재 경로가 /signin이 아닌 경우에만 리다이렉트
          if (
            typeof window !== "undefined" &&
            window.location.pathname !== "/signin"
          ) {
            router.replace("/signin");
          }
          return { success: false, data: undefined };
        }

        if (error.response?.status === 500) {
          throw new Error(
            `서버 에러가 발생했습니다 (${error.response.status}): ${error.message}`
          );
        }
        throw err;
      }
    },
    enabled: shouldFetchUser,
    // 캐시 설정 추가
    gcTime: 30 * 60 * 1000,
    staleTime: 30 * 60 * 1000,
    retry: (failureCount, error) => {
      // 401, 403 에러는 재시도하지 않음
      const err = error as { response?: { status: number } };
      if (err.response?.status === 401 || err.response?.status === 403) {
        return false;
      }
      return failureCount < 2; // 최대 2번 재시도
    },
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 방지
    refetchOnMount: false, // 컴포넌트 마운트 시 자동 refetch 방지
    refetchOnReconnect: false,
  });

  // 에러 발생 시 처리
  useEffect(() => {
    if (error) {
      const err = error as { response?: { status: number } };
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.log("useCurrentUser: 인증 에러로 인한 자동 로그아웃");
      }
    }
  }, [error]);

  return {
    user: userData?.data || undefined,
    isLoading,
    error,
  };
};
