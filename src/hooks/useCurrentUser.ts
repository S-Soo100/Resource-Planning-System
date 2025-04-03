import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/api/user-api";
import { IUser } from "@/types/user";
import { ApiResponse } from "@/api/api";
import { getAuthCookie } from "@/api/cookie-api";

interface UseCurrentUserReturn {
  user: IUser | undefined;
  isLoading: boolean;
  error: Error | null;
}

export const useCurrentUser = (): UseCurrentUserReturn => {
  const auth = getAuthCookie();
  console.log("auth = " + auth);

  const {
    data: userData,
    isLoading,
    error,
  } = useQuery<ApiResponse<IUser>, Error>({
    queryKey: ["user", auth?.id],
    queryFn: () => userApi.getUser(auth!.id.toString()),
    enabled: !!auth?.id,
  });

  return {
    user: userData?.data,
    isLoading,
    error,
  };
};
