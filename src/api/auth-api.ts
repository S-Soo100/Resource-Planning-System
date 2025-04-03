import { LoginAuth, LoginResponse } from "@/types/loginAuth";
import { api, ApiResponse } from "./api";
import { setAuthCookie, setToken } from "./cookie-api";

export const authApi = {
  // 로그인
  login: async (data: LoginAuth): Promise<ApiResponse<LoginResponse>> => {
    try {
      const response = await api.post<LoginResponse>("/auth/login", data);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      console.log("로그인 응답:", response.data);
      // if (isIAuth(response.data.data)) {
      setToken(response.data.token);
      setAuthCookie(response.data.user);
      // }
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
