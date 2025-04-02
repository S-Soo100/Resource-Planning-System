import { LoginAuth, LoginResponse } from "@/types/loginAuth";
import { api, ApiResponse } from "./api";

export const loginApi = {
  // 로그인
  login: async (data: LoginAuth): Promise<ApiResponse<LoginResponse>> => {
    try {
      const response = await api.post<LoginResponse>("/auth/login", data);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      console.log("로그인 응답:", response.data);
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
