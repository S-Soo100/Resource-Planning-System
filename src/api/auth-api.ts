import { LoginAuth, LoginResponse } from "@/types/(auth)/loginAuth";
import { api, ApiResponse } from "./api";
import { setToken } from "./cookie-api";
import { authStore } from "@/store/authStore";

export const authApi = {
  // 로그인
  login: async (data: LoginAuth): Promise<ApiResponse<LoginResponse>> => {
    try {
      const response = await api.post<LoginResponse>("/auth/login", data);
      setToken(response.data.token);
      // authStore.getState().login(response.data.user);
      // console.log("어스API 호출의 반환값: ", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: `${error}발생, 로그인에 실패했습니다.` };
    }
  },

  // 로그아웃
  logout: (): void => {
    localStorage.removeItem("token");
    authStore.getState().logout();
    window.location.href = "/signin";
  },
};
