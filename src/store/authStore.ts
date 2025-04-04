import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IAuth } from "@/types/auth";

interface AuthState {
  user: IAuth | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // Actions
  login: (user: IAuth) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: (user) =>
        set({
          user,
          isAuthenticated: true,
          error: null,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        }),

      setLoading: (loading) =>
        set({
          isLoading: loading,
        }),

      setError: (error) =>
        set({
          error,
        }),
    }),
    {
      name: "auth-storage", // 로컬 스토리지에 저장될 키 이름
    }
  )
);

// 커스텀 훅으로 authStore 사용
export const useAuthStore = () => {
  const store = authStore();

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    login: (user: IAuth) => store.login(user),
    logout: () => store.logout(),
    setLoading: (loading: boolean) => store.setLoading(loading),
    setError: (error: string | null) => store.setError(error),
  };
};
