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
    queryFn: () => userApi.getUser(auth!.id.toString()),
    enabled: !!auth?.id,
    // 캐시 설정 추가
    gcTime: 30 * 60 * 1000, // 30분
    staleTime: 5 * 60 * 1000, // 5분
  });
  return {
    user: userData?.data || undefined,
    isLoading,
    error,
  };
};
