import { authStore } from "@/store/authStore";
import { IAuth } from "@/types/(auth)/auth";

interface UseAuthReturn {
  user: IAuth | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (user: IAuth) => void;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const user = authStore((state) => state.user);
  const isAuthenticated = authStore((state) => state.isAuthenticated);
  const isLoading = authStore((state) => state.isLoading);
  const error = authStore((state) => state.error);
  const login = authStore((state) => state.login);
  const logout = authStore((state) => state.logout);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  };
}
