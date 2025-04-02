import { api, ApiResponse } from "./api";
import { UserLogin, UserLoginResponse } from "@/types/user";

export const loginApi = {
  // 로그인
  login: async (data: UserLogin): Promise<ApiResponse<UserLoginResponse>> => {
    try {
      const response = await api.post<UserLoginResponse>("/auth/login", data);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: `${error}발생, 로그인에 실패했습니다.` };
    }
  },

  // 로그아웃
  logout: (): void => {
    localStorage.removeItem("token");
    // window.location.href = "/login";
  },
};
