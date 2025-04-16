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
    const response = await teamApi.getTeam(teamId.toString());
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
};
