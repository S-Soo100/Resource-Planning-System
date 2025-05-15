// lib/api.ts
import axios from "axios";
import { getToken } from "./cookie-api";

const baseURL = process.env.NEXT_PUBLIC_API_URL;
// console.log("API Base URL:", baseURL);

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    console.log("API 요청:", {
      url: config.url,
      method: config.method,
      headers: config.headers,
    });
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.log("API 요청 에러:", error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    console.log("API 응답:", {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.log("API 응답 에러:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/signin";
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
