import { authApi } from "@/api/auth-api";
import { teamApi } from "@/api/team-api";
import { authStore } from "@/store/authStore";
import { LoginAuth } from "@/types/loginAuth";

export const authService = {
  login: async (auth: LoginAuth): Promise<boolean> => {
    const response = await authApi.login(auth);
    if (response == null || !response.data) {
      return false;
    }
    authStore.getState().login(response.data.user);
    if (authStore.getState().user == response.data.user) {
      console.log("authService 호출 성공했음: ", response.data.user);
    }
    return true;
  },

  selectTeam: async (teamId: number): Promise<boolean> => {
    console.log("팀 선택 시도 - teamId:", teamId);
    const response = await teamApi.getTeam(teamId.toString());
    if (response == null || !response.data) {
      console.error("팀 선택 실패 - 응답 데이터 없음");
      return false;
    }
    console.log("팀 선택 성공 - 받은 데이터:", response.data);
    authStore.getState().setTeam(response.data);
    const currentTeam = authStore.getState().selectedTeam;
    console.log("authStore에 저장된 팀:", currentTeam);
    return true;
  },
};
