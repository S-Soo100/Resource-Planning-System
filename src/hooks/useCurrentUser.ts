import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/api/user-api";
import { ApiResponse } from "@/api/api";
// import { getAuthCookie } from "@/api/cookie-api";
import { authStore } from "@/store/authStore";
import { IUser } from "@/types/(auth)/user";

interface UseCurrentUserReturn {
  user: IUser | undefined;
  isLoading: boolean;
  error: Error | null;
}

export const useCurrentUser = (): UseCurrentUserReturn => {
  // const auth = getAuthCookie();
  const auth = authStore((state) => state.user);
  // console.log("auth from store:", auth);

  const {
    data: userData,
    isLoading,
    error,
  } = useQuery<ApiResponse<IUser>, Error>({
    queryKey: ["user", auth?.id],
    queryFn: async () => {
      try {
        const response = await userApi.getUser(auth!.id.toString());
        if (!response.success) {
          throw new Error(
            response.error || "사용자 정보를 가져오는데 실패했습니다"
          );
        }
        return response;
      } catch (err: unknown) {
        console.error("사용자 정보 조회 에러:", err);
        const error = err as { response?: { status: number }; message: string };
        if (error.response?.status === 500) {
          throw new Error(
            `서버 에러가 발생했습니다 (${error.response.status}): ${error.message}`
          );
        }
        throw err;
      }
    },
    enabled: !!auth?.id,
    // 캐시 설정 추가
    gcTime: 30 * 60 * 1000,
    staleTime: 30 * 60 * 1000,
    retry: 3,
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 방지
    refetchOnMount: false, // 컴포넌트 마운트 시 자동 refetch 방지
    refetchOnReconnect: false,
  });

  return {
    user: userData?.data || undefined,
    isLoading,
    error,
  };
};
