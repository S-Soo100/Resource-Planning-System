import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/api/user";
import { authStore } from "@/store/authStore";
import { IUser } from "@/types/user";
import { ApiResponse } from "@/api/api";

interface UseCurrentUserReturn {
  user: IUser | undefined;
  isLoading: boolean;
  error: Error | null;
}

export const useCurrentUser = (): UseCurrentUserReturn => {
  const { user } = authStore();

  const {
    data: userData,
    isLoading,
    error,
  } = useQuery<ApiResponse<IUser>, Error>({
    queryKey: ["user", user?.id],
    queryFn: () => userApi.getUser(user!.id.toString()),
    enabled: !!user?.id,
  });

  return {
    user: userData?.data,
    isLoading,
    error,
  };
};
