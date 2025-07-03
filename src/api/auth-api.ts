import { LoginAuth, LoginResponse } from "@/types/(auth)/loginAuth";
import { api, ApiResponse } from "./api";
import { setToken } from "./cookie-api";
import { authStore } from "@/store/authStore";
import axios from "axios";

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

  // 비밀번호 검증만 (격리된 axios 인스턴스 사용으로 인터셉터 회피)
  validatePassword: async (data: LoginAuth): Promise<ApiResponse<boolean>> => {
    try {
      // 격리된 axios 인스턴스 생성 (인터셉터 없음)
      const isolatedApi = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
        timeout: 15000,
        headers: {
          "Content-Type": "application/json",
        },
      });

      await isolatedApi.post<LoginResponse>("/auth/login", data);
      return { success: true, data: true };
    } catch {
      return { success: false, data: false };
    }
  },

  // 로그아웃
  logout: (): void => {
    localStorage.removeItem("token");
    authStore.getState().logout();
    window.location.href = "/signin";
  },
};
