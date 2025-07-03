import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IAuth } from "@/types/(auth)/auth";
import { Team } from "@/types/team";
import { emitEvent, EVENTS } from "@/utils/events";

interface AuthState {
  user: IAuth | null;
  selectedTeam: Team | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (user: IAuth) => void;
  logout: () => void;
  updateUser: (user: IAuth) => void;
  setTeam: (team: Team) => void;
  resetTeam: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const authStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      selectedTeam: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: (user) => {
        set({
          user,
          selectedTeam: null,
          isAuthenticated: true,
          error: null,
        });

        // 로그인 이벤트 발행
        emitEvent(EVENTS.AUTH_LOGIN, { userId: user.id });
        // 모든 데이터 초기화 이벤트 발행
        emitEvent(EVENTS.DATA_RESET_ALL);
      },

      logout: () => {
        set({
          user: null,
          selectedTeam: null,
          isAuthenticated: false,
          error: null,
        });

        // 로그아웃 이벤트 발행
        emitEvent(EVENTS.AUTH_LOGOUT);
        // 모든 데이터 초기화 이벤트 발행
        emitEvent(EVENTS.DATA_RESET_ALL);
      },

      updateUser: (user) => {
        set((state) => ({
          ...state,
          user,
          error: null,
        }));
      },

      setTeam: (team: Team) => {
        const previousTeam = get().selectedTeam;

        set({ selectedTeam: team });

        // 팀 변경 이벤트 발행
        emitEvent(EVENTS.AUTH_TEAM_CHANGED, {
          teamId: team.id,
          teamName: team.teamName,
        });

        // 이전 팀과 다른 경우에만 팀 종속 데이터 초기화
        if (previousTeam?.id !== team.id) {
          emitEvent(EVENTS.DATA_RESET_TEAM_DEPENDENT);
        }
      },

      resetTeam: () => {
        set({ selectedTeam: null });

        // 팀 리셋 이벤트 발행
        emitEvent(EVENTS.AUTH_TEAM_RESET);
        // 팀 종속 데이터 초기화 이벤트 발행
        emitEvent(EVENTS.DATA_RESET_TEAM_DEPENDENT);
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      // 민감하지 않은 정보만 persist
      partialize: (state) => ({
        user: state.user,
        selectedTeam: state.selectedTeam,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * authStore 사용을 위한 커스텀 훅
 * 필요한 상태와 액션만 선택적으로 반환
 */
export const useAuthStore = () => {
  const store = authStore();

  return {
    user: store.user,
    selectedTeam: store.selectedTeam,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    login: store.login,
    logout: store.logout,
    updateUser: store.updateUser,
    setTeam: store.setTeam,
    resetTeam: store.resetTeam,
    setLoading: store.setLoading,
    setError: store.setError,
    clearError: store.clearError,
  };
};

/**
 * 인증 상태만 반환하는 경량 훅
 */
export const useAuth = () => {
  const isAuthenticated = authStore((state) => state.isAuthenticated);
  const user = authStore((state) => state.user);

  return { isAuthenticated, user };
};

/**
 * 선택된 팀 정보만 반환하는 경량 훅
 */
export const useSelectedTeam = () => {
  const selectedTeam = authStore((state) => state.selectedTeam);
  const setTeam = authStore((state) => state.setTeam);
  const resetTeam = authStore((state) => state.resetTeam);

  return { selectedTeam, setTeam, resetTeam };
};
