// lib/api.ts
import axios from "axios";
import { getToken } from "./cookie-api";
import { authStore } from "@/store/authStore";
import Cookies from "js-cookie";

const baseURL = process.env.NEXT_PUBLIC_API_URL;
// console.log("API Base URL:", baseURL);

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("요청 에러:", error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    console.log(
      `[API] ${response.config.method?.toUpperCase()} ${
        response.config.url
      } - ${response.status}`,
      response.data
    );
    return response;
  },
  (error) => {
    console.log(
      `[API] ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${
        error.response?.status || "ERROR"
      }`,
      error.response?.data || error.message
    );
    if (error.response?.status === 401) {
      // 토큰 제거
      localStorage.removeItem("token");
      Cookies.remove("token");

      // authStore 초기화
      authStore.getState().logout();

      // 현재 경로가 /signin이 아닌 경우에만 리다이렉트
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/signin"
      ) {
        console.log("401 에러 감지, /signin으로 리다이렉트");
        window.location.replace("/signin"); // replace를 사용하여 히스토리에 남지 않도록 함
      }
    }
    return Promise.reject(error);
  }
);

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// API 에러 타입
export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export const fetchPosts = async () => {
  const response = await axios.get(`${baseURL}/posts`);
  return response.data;
};
