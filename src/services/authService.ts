import { authApi } from "@/api/auth-api";
import { teamApi } from "@/api/team-api";
import { authStore } from "@/store/authStore";
import { LoginAuth } from "@/types/(auth)/loginAuth";
import { Team } from "@/types/team";

export const authService = {
  login: async (auth: LoginAuth): Promise<boolean> => {
    const response = await authApi.login(auth);
    if (response == null || !response.data) {
      return false;
    }
    authStore.getState().login(response.data.user);
    return true;
  },

  selectTeam: async (teamId: number): Promise<boolean> => {
    // console.log("팀 선택 시도 - teamId:", teamId);
    const response = await teamApi.getTeam(teamId);
    if (response == null || !response.data) {
      console.error("팀 선택 실패 - 응답 데이터 없음");
      return false;
    }
    authStore.getState().setTeam(response.data);
    return true;
  },

  getSelectedTeam: (): Team | null => {
    if (authStore.getState().selectedTeam)
      return authStore.getState().selectedTeam;
    return null;
  },

  // 현재 선택된 팀 정보를 서버에서 다시 가져와 업데이트하는 함수
  refreshSelectedTeam: async (): Promise<boolean> => {
    const currentTeam = authStore.getState().selectedTeam;
    if (!currentTeam || !currentTeam.id) {
      console.error("팀 정보 갱신 실패 - 선택된 팀 없음");
      return false;
    }

    try {
      console.log("팀 정보 갱신 시도 - teamId:", currentTeam.id);
      const response = await teamApi.getTeam(currentTeam.id);
      if (response == null || !response.data) {
        console.error("팀 정보 갱신 실패 - 응답 데이터 없음");
        return false;
      }

      // 팀 정보 업데이트
      authStore.getState().setTeam(response.data);
      console.log("팀 정보 갱신 성공", response.data);
      return true;
    } catch (error) {
      console.error("팀 정보 갱신 중 오류 발생:", error);
      return false;
    }
  },
};
