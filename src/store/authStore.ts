import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IAuth } from "@/types/(auth)/auth";
import { Team } from "@/types/team";
import { useCategoryStore } from "@/store/categoryStore";

interface AuthState {
  user: IAuth | null;
  selectedTeam: Team | null;
  // selectedTeamId:
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // Actions
  login: (user: IAuth) => void;
  logout: () => void;
  setTeam: (team: Team) => void;
  resetTeam: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      selectedTeam: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: (user) => {
        // 카테고리 스토어 초기화
        useCategoryStore.getState().resetCategories();
        return set({
          user,
          selectedTeam: null,
          isAuthenticated: true,
          error: null,
        });
      },

      logout: () => {
        // 카테고리 스토어 초기화
        useCategoryStore.getState().resetCategories();
        set({
          user: null,
          selectedTeam: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setTeam: (team: Team) => {
        // 팀 변경 시 카테고리 데이터 새로 로드
        useCategoryStore.getState().resetCategories();
        set({ selectedTeam: team });
      },

      resetTeam: () => {
        // 팀 초기화 시 카테고리 데이터 초기화
        useCategoryStore.getState().resetCategories();
        set({ selectedTeam: null });
      },

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
